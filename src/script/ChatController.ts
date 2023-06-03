import {getCurrentInstance, reactive, ref, nextTick} from "vue";
import {invoke} from "@tauri-apps/api/tauri";
import {WebviewWindow} from "@tauri-apps/api/window";
import {emit, listen, once} from "@tauri-apps/api/event";
import {createDir, readTextFile, BaseDirectory} from "@tauri-apps/api/fs";
import {exists} from "@tauri-apps/api/fs";
import {documentDir} from "@tauri-apps/api/path";

//Our Api
import {getUserInfo, getUserList} from "../common/Api";

import {EventType, LocalFn, MsgType, NEUChat, PagePath} from "../common/Constants";


const user = reactive({
    account: "",
    userName: "",
    avatar: "",
});

const msgObj = reactive<Record<string, any>> ({
    msg:"",
    msgType:"",
    receiver:"",
    sender:"",
    senderAvatar:"",
});


const userList = ref<Record<string, any>[]>([]);

const chatHistory = ref<Record<string, any>>([]);

const userIdx = ref(-1);

const acceptState = ref(false);


let record: HTMLDivElement;

let ws: WebSocket;

const init = async () => {
    const instance = getCurrentInstance();
    record = instance?.refs.record as HTMLDivElement;

    const {
        account,
        userName,
        avatar
    } = (await getUserInfo<typeof user>()).data;

    user.account = msgObj.sender = account;
    user.userName = userName;
    user.avatar = msgObj.senderAvatar = avatar;

    userList.value = (await getUserList()).data;

    initWS();
};

const initWS = () => {
    ws = new WebSocket(`ws://localhost:6503/chat/${user.account}`);

    ws.onopen = () => {
        setInterval(() => {
            sendToServer({
                msgType:MsgType.DOGE
            });
        }, 1000 * 60);
    }

    ws.onmessage = (event: MessageEvent) => {
        const data: Record<string, any> = JSON.parse(event.data);
        switch (data.msgType) {

            case MsgType.MESSAGE:
                handleChatMsg(data).then(() => {});
                break;

            case MsgType.VIDEO_REQUEST:
                handleVideoRequestMsg(data).then(() => {});
                break;

            case MsgType.VIDEO_ANSWER || MsgType.NEW_ICE_CANDIDATE:
                emit(EventType.VIDEO_CHAT, data).then(() => {});
                break;

            case MsgType.VIDEO_OVER:
                if (data.msg) {
                    emit(EventType.VIDEO_CHAT, data);
                } else {
                    emit(EventType.VIDEO_SELECTION, data);
                }
                break;
        }
    };

    ws.onerror = () => {
        //Retry
        initWS();
    };

}

const handleChatMsg = async (data: Record<string, any>) => {
    await createUserDir();

    data.isSend = 2;

    const filePath = `${await documentDir()}\\${NEUChat.DIR}\\${user.account}\\${data.sender}${NEUChat.SUFFIX}`;

    await invoke(LocalFn.SAVE_CHAT_HISTORY, {
        filePath,
        data: JSON.stringify(data),
    });

    let selectAccount;

    if (userIdx.value != -1) {
        selectAccount = userList.value[userIdx.value].account;
    }

    if (data.sender == selectAccount) {
       await getChatHistory(filePath);
    } else {
        const sender = userList.value.find(i => i.account == data.sender);

        sender!.unread = true;
    }
}

const createUserDir = async () => {
    const dir = `${NEUChat.DIR}\\${user.account}`;

    const isExists = await exists(dir, {dir: BaseDirectory.Document});

    if (!isExists) {
        await createDir(dir, {dir: BaseDirectory.Document, recursive: true});
    }
}

const handleVideoRequestMsg = async (data: Record<string, any>)=> {
    new WebviewWindow(EventType.VIDEO_SELECTION, {
        url: PagePath.VIDEO_SELECTION_VIEW,
        width: 300,
        height: 200,
        decorations: false,
        resizable: false,
        x: 0,
        y: 200,
    });

    const unListen = await listen<Record<string, any>>(EventType.CHAT_B, async (event) => {
        const payload = event.payload;
        switch (payload.msgType) {
            case MsgType.READY:
                emit(EventType.VIDEO_SELECTION, {
                    msg: data.sender
                });
                break;

            case MsgType.ACCEPT_STATE:
                acceptState.value = payload.msg;
                if (payload.msg) {
                    videoCall(false, data);
                } else {
                    msgObj.msgType = MsgType.VIDEO_OVER;
                    msgObj.receiver = data.sender;

                    sendToServer(msgObj);
                }

                await unListen();
                break;
        }
    })
}

const sendToServer = (data: Record<string, string>) => {
    const json = JSON.stringify(data);
    ws.send(json);
}

const sendMsg = async () => {
    if (!msgObj.msg || !msgObj.receiver) {
        return;
    }

    msgObj.msgType = MsgType.MESSAGE;

    sendToServer(msgObj);
    await createUserDir();

    msgObj.isSend = 1;
    const filePath = `${await documentDir()}\\${NEUChat.DIR}\\${user.account}\\${msgObj.receiver}${NEUChat.SUFFIX}`;

    await invoke(LocalFn.SAVE_CHAT_HISTORY, {
        filePath,
        data: JSON.stringify(msgObj),
    });

    msgObj.msg = ""

    await getChatHistory(filePath);
};

const selectUser = async (idx: number) => {
    userIdx.value = idx;
    userList.value[idx].unread = false;
    msgObj.receiver = userList.value[idx].account;

    const filePath = '${NEUChat.DIR}\\${user.account}\\${msgObj.receiver}${NEUChat.SUFFIX}' ;

    const isExists = await exists(filePath, {dir: BaseDirectory.Document});

    if (isExists) {
        await getChatHistory(filePath);
        record.scrollTop = record.scrollHeight;
    } else {
        chatHistory.value = [];
    }
};

const getChatHistory = async (filePath: string) => {
    const contents = await readTextFile(filePath, {dir: BaseDirectory.Document});
    const history: Record<string, any>[] = [];

    const data = contents.split("\n");
    data.forEach(i => {
        if (i) {
            history.push(JSON.parse(i));
        }
    })

    chatHistory.value = history;

    await nextTick(() => {
        scrollBar();
    });
};

    const scrollBar = () => {
        record?.scrollTo({
            top: record.scrollHeight,
            left: 0,
            behavior: "smooth",
        });
    };

    const videoCall = async (isSend: boolean, data?: Record<string, any>)=> {
        new WebviewWindow(EventType.VIDEO_CHAT, {
            url: PagePath.VIDEO_CHAT_VIEW,
            minWidth: 800,
            minHeight: 600,
            decorations: false,
        });

        const unListen = await once(EventType.VIDEO_CHAT_READY, async () => {
            if (isSend) {
                await emit(EventType.VIDEO_CHAT, {
                    msgType: MsgType.READY,
                    msg: isSend
                });
            } else {
                await emit(EventType.VIDEO_CHAT, data);
            }
            unListen();
        })

        await listen<Record<string, any>>(EventType.CHAT_A, (event) => {
            const payload = event.payload;

            sendToServer({
                msgType: payload.msgType,
                msg: payload.msg,
                receiver:payload.receiver || msgObj.receiver,
                sender: msgObj.sender
            });
        })
    };


export {
    selectUser,
    videoCall,
    sendMsg,
    init,
}

export {
    user,
    msgObj,
    userIdx,
    chatHistory,
    userList
}