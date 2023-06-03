enum MsgType {
    DOGE = "doge",
    MESSAGE = "message",
    VIDEO_REQUEST = "vRequest",
    VIDEO_ANSWER = "vAnswer",
    NEW_ICE_CANDIDATE = "nIceCan",
    READY = "ready",
    ACCEPT_STATE = "acceptState",
    VIDEO_OVER = "vOver"
}

enum EventType {
   CHAT_A = "chatA",
   CHAT_B = "chatB",
   VIDEO_CHAT = "videoChat",
   VIDEO_CHAT_READY = "videoChatReady",
   VIDEO_SELECTION = "videoSelection"
}

class LocalFn {
    public static SAVE_CHAT_HISTORY = "saveChatHistory";
}

class PagePath {
    public static CHAT_VIEW = "#/chat";
    public static VIDEO_SELECTION_VIEW = "#/videoSelection";
    public static VIDEO_CHAT_VIEW = "#/videoChat";
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