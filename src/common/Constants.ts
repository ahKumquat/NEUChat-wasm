enum MsgType {
    DOGE = "doge",
    MESSAGE = "message",
    VOICE_ANSWER = "voAnswer",
    NEW_ICE_CANDIDATE = "nIceCan",
    READY = "ready",
    ACCEPT_STATE = "acceptState",
    VOICE_OFFER = "voOffer"
}

enum EventType {
   CHAT_A = "chatA",
   CHAT_B = "chatB",
   VOICE_CHAT = "voiceChat",
   VOICE_CHAT_READY = "voiceChatReady",
   VIDEO_CHAT = "videoChat",
}

class LocalFn {
    public static SAVE_CHAT_HISTORY = "save_chat_history";
}

class PagePath {
    public static CHAT_VIEW = "#/chat";
}

class NEUChat {
    public static DIR = "NEUChat files";
    public static SUFFIX = ".txt";
}

export {
    MsgType,
    EventType,
    LocalFn,
    PagePath,
    NEUChat
}