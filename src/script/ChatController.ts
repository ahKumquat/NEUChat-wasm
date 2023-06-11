import {getCurrentInstance, nextTick, reactive, ref} from "vue";
import {invoke} from "@tauri-apps/api/tauri";
import {emit, listen} from "@tauri-apps/api/event";
import {BaseDirectory, createDir, exists, readTextFile} from "@tauri-apps/api/fs";
import {documentDir} from "@tauri-apps/api/path";

//Our Api
import {getUserInfo, getUserList} from "../common/Api";

import {EventType, LocalFn, MsgType, NEUChat} from "../common/Constants";


const user = reactive<Record<string, any>>({
    account:""
});

let msgObj = reactive<Record<string, any>> ({
    msg:"",
    msg_type:"",
    receiver:"",
    sender:"",
    sender_avatar:"",
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

    const account = (await getUserInfo<typeof user>()).data;
    user.account = msgObj.sender = account;

    userList.value = (await getUserList()).data;

    const filterList:Record<string, any>[] = []

    for (let u of userList.value) {
        if (user.account != u) {
            filterList.push(u)
        }
    }

    userList.value = filterList

    if (account) {
        //first try
        ws = new WebSocket(`ws://localhost:1420/chat/${account}`);

        initWS();
    }

};

const initWS = () => {
    ws = new WebSocket(`ws://localhost:1420/chat/${msgObj.sender}`);

    ws.onopen = () => {
        setInterval(() => {
            sendToServer({
                msg_type:MsgType.DOGE,
                msg:"",
                receiver:"",
                sender:"",
                sender_avatar:"",
            });
        }, 1000 * 60);

        listen<Record<string, any>>(EventType.CHAT_A, (event) => {
            const payload = event.payload;
            sendToServer({
                msgType: payload.msgType,
                msg: payload.msg,
                receiver: payload.receiver || msgObj.receiver,
                sender: msgObj.sender
            })
        }).then()
    }

    ws.onmessage = (event: MessageEvent) => {
        const data: Record<string, any> = JSON.parse(event.data);
        switch (data.msg_type) {

            case MsgType.MESSAGE:
                handleChatMsg(data).then(() => {});
                break;

            case  MsgType.NEW_ICE_CANDIDATE:
                emit(EventType.VIDEO_CHAT, data).then(() => {});
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

    const filePath = navigator.userAgent.indexOf("Windows") != -1 ? `${await documentDir()}\\${NEUChat.DIR}\\${user.account}\\${msgObj.receiver}${NEUChat.SUFFIX}` : `${await documentDir()}\/${NEUChat.DIR}\/${user.account}\/${msgObj.receiver}${NEUChat.SUFFIX}`;

    await invoke(LocalFn.SAVE_CHAT_HISTORY, {
        filePath,
        data: JSON.stringify(data),
    });

    let selectAccount;

    if (userIdx.value != -1) {
        selectAccount = userList.value[userIdx.value];
    }

    if (data.sender == selectAccount) {
       await getChatHistory(filePath);
    } else {
        const sender = userList.value.find(i => i == data.sender);

        sender!.unread = true;
    }
}

const createUserDir = async () => {
    let dir = navigator.userAgent.indexOf("Windows") != -1 ? `${NEUChat.DIR}\\${user.account}` : `${NEUChat.DIR}\/${user.account}`

    const isExists = await exists(dir, {dir: BaseDirectory.Document});

    if (!isExists) {
        await createDir(dir, {dir: BaseDirectory.Document, recursive: true});
    }
}



const sendToServer = (data: Record<string, string>) => {
    const json = JSON.stringify(data);
    ws.send(json);
}

const sendMsg = async () => {
    if (!msgObj.msg || !msgObj.receiver) {
        return;
    }

    msgObj.msg_type = MsgType.MESSAGE;

    sendToServer(msgObj);
    await createUserDir();

    msgObj.isSend = 1;

    const filePath = navigator.userAgent.indexOf("Windows") != -1 ? `${await documentDir()}\\${NEUChat.DIR}\\${user.account}\\${msgObj.receiver}${NEUChat.SUFFIX}` : `${await documentDir()}\/${NEUChat.DIR}\/${user.account}\/${msgObj.receiver}${NEUChat.SUFFIX}`;

    await invoke(LocalFn.SAVE_CHAT_HISTORY, {
        filePath,
        data: JSON.stringify(msgObj),
    });

    msgObj.msg = ""

    await getChatHistory(filePath);
};

const selectUser = async (idx: number) => {
    userIdx.value = idx;
    //userList.value[idx].unread = false;
    msgObj.receiver = userList.value[idx];

    const filePath = navigator.userAgent.indexOf("Windows") != -1 ? `${await documentDir()}\\${NEUChat.DIR}\\${user.account}\\${msgObj.receiver}${NEUChat.SUFFIX}` : `${await documentDir()}\/${NEUChat.DIR}\/${user.account}\/${msgObj.receiver}${NEUChat.SUFFIX}`;


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




export {
    selectUser,
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