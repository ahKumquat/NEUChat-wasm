import {reactive} from "vue";
import {EventType, MsgType} from "../common/Constants";
import {emit, listen} from "@tauri-apps/api/event";
import {Ref} from "vue";


let dis: number = 0;
let context:any;

const objectC = {
    x:0,
    y:0,
}

const position = {
    x:0,
    y:0,
}

const offset = {
    x:0,
    y:0,
}

const msgObj= reactive<Record<string, any>>({
    msg: "",
    msgType: "",
    receiver: "",
    sender: "",
})

let height = 0;
let width = 0;

let audioContext =  new AudioContext();
let audioSource;
let volumeNodeL: GainNode;
let volumeNodeR: GainNode;
let channelsCount;
let splitterNode;
let mergerNode;
let pc:RTCPeerConnection = new RTCPeerConnection();
let webStream: MediaStream = new MediaStream();
let audio:Ref<HTMLAudioElement>;
let remote:Ref<HTMLAudioElement>;

const beforeInit = async () => {
    msgObj.msgType = MsgType.READY;
    await emit(EventType.VOICE_CHAT_READY, msgObj);

    await listen<Record<string, any>>(EventType.VOICE_CHAT, (event) => {
        const payload = event.payload;
        switch (payload.msgType) {
            case MsgType.READY:
                voiceCall(payload.msg);
                break;
            case MsgType.VOICE_OFFER:
                handleVoiceOfferMsg(payload);
                break;
            case MsgType.VOICE_ANSWER:
                handleVoiceAnswerMsg(payload);
                break;
            case MsgType.NEW_ICE_CANDIDATE:
                handleNewICECandidateMsg(payload);
                break;
        }
    });
}

const init = (game: any, other: any, local: any, w: number, h: number) => {
    context = game;
    context.fillRect(position.x, position.y, 20, 20);
    context.fillStyle = "#FF0000";
    context.fillRect(objectC.x, objectC.y, 20, 20);

    width = w;
    height = h;

    remote = other;
    audio = local

    window.addEventListener("keypress",
        e => {
            switch (e.code) {
                case "KeyA":
                    position.x -= 5;
                    if (position.x < 0) {
                        position.x = 0;
                    }
                    break

                case "KeyS":
                    position.y += 5;
                    if (position.y > height - 20) {
                        position.y = height - 20;
                    }
                    break

                case "KeyD":
                    position.x += 5;
                    if (position.x > width - 20) {
                        position.x = width - 20;
                    }
                    break

                case "KeyW":
                    position.y -= 5;
                    if (position.y < 0) {
                        position.y = 0;
                    }
                    break
            }
            context.clearRect(
                0,
                0,
                width,
                height
            );
            context.fillStyle = "#000000";
            context.fillRect(position.x, position.y, 20, 20);
            context.fillStyle = "#FF0000";
            context.fillRect(objectC.x, objectC.y, 20, 20);

            offset.x = calcOffset(position.x, objectC.x);
            offset.y = calcOffset(position.y, objectC.y);

            dis = getDistance(offset.x, offset.y);

            if (typeof volumeNodeR.gain != 'undefined') {
                trackingVoice(dis, offset.x, volumeNodeR, volumeNodeL);
            }
        })
    voiceCall(true).then();
}

const trackingVoice = (dis:number, x:number, r: GainNode, l: GainNode)=>{
    if (dis < 100) {
        const rad = dis / 100;
        r.gain.value = x > 0 ? 1 - Math.pow(rad,2) : Math.abs(1 - Math.pow(rad,10))
        l.gain.value = x > 0 ? 1 - Math.pow(rad,10) : Math.abs(1 - Math.pow(rad,2))
    } else {
        r.gain.value = 0
        l.gain.value = 0
    }
}

const calcOffset = (a: number, b: number) => {
    return a - b;
}

const getDistance = (a: number, b: number) => {
    return Math.round(Math.sqrt(Math.pow((a), 2)
        + Math.pow((b), 2)));
}



const initRTCPeerConnection = ()=>{
    pc = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.1.google.com:19302"
            },
            {
                urls:"turn:numb.viagenie.ca",
                username: "webrtc@live.com",
                credential:"muazkh"
            },
        ],
    });

    pc.onicecandidate = handICECandidateEvent;
    pc.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    pc.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    pc.onsignalingstatechange = handleSignalingStateChangeEvent;

    pc.ontrack = handleTrackEvent;
}

const handleVoiceOfferMsg = async (data: Record<string, any>) => {
    msgObj.receiver = data.sender;
    await voiceCall(false);
    const desc = new RTCSessionDescription(data.msg);

    await pc.setRemoteDescription(desc);
    await pc.setLocalDescription(await pc.createAnswer());

    msgObj.msgType = MsgType.VOICE_ANSWER;
    msgObj.msg = pc.localDescription;

    sendToServer()
}

async function voiceCall(isSender: boolean) {
    initRTCPeerConnection()
    await navigator.mediaDevices.getUserMedia(
        {
            video: true,
            audio: true,
        }
    ).then(stream => {
        audio.value!.srcObject = stream;
         stream.getTracks().forEach((track: MediaStreamTrack) =>
            pc.addTrack(track, stream)
        );
    });

    if (isSender) {
        await sendOffer();
    }

    // For voice tracking
    //this.audioSource = this.audioContext.createMediaElementSource(this.audio);

    // audioSource = audioContext.createMediaStreamSource(webStream);
    //
    // volumeNodeL = new GainNode(audioContext);
    // volumeNodeR = new GainNode(audioContext);
    //
    // channelsCount = 2;
    // splitterNode = new ChannelSplitterNode(audioContext, { numberOfOutputs: channelsCount });
    // mergerNode = new ChannelMergerNode(audioContext, { numberOfInputs: channelsCount });
    // audioSource.connect(splitterNode);
    // splitterNode.connect(volumeNodeL, 0);
    // splitterNode.connect(volumeNodeR, 1);
    //
    // volumeNodeL.connect(mergerNode, 0, 0);
    // volumeNodeR.connect(mergerNode, 0, 1);
    //
    // mergerNode.connect(audioContext.destination);

}

async function handleVoiceAnswerMsg(data: Record<string, any>) {
    const desc = new RTCSessionDescription(data.msg);
    await pc.setRemoteDescription(desc).catch(reportError)
}

async function handleNewICECandidateMsg(data: Record<string, any>) {
    const candidate = new RTCIceCandidate(data.msg);
    try {
        await pc.addIceCandidate(candidate);
    } catch (err) {
        reportError(err);
    }
}

function handICECandidateEvent(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
        msgObj.msgType = MsgType.NEW_ICE_CANDIDATE;
        msgObj.msg = event.candidate;
        sendToServer();
    }
}

function handleICEConnectionStateChangeEvent() {
    console.log("ICE Connection State:" + pc.iceConnectionState);
}

function handleICEGatheringStateChangeEvent() {
    console.log("ICE Gathering State:" + pc.iceGatheringState);
}

function handleSignalingStateChangeEvent() {
    console.log("WebRTC Signaling State:" + pc.signalingState);
}

function handleTrackEvent (event: RTCTrackEvent) {
    remote.value!.srcObject = event.streams[0];
}

function sendToServer() {
    emit(EventType.CHAT_A, msgObj).then();
}



async function sendOffer() {
    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);

    msgObj.msgType = MsgType.VOICE_OFFER
    msgObj.msg = pc.localDescription;

    // console.log(offer)
    // sendToServer();
    await emit(EventType.VOICE_CHAT, msgObj);
}

export {
    init,
    beforeInit,
}


export {
    context,
    objectC,
    position,
    offset
}