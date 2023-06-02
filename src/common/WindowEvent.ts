import {appWindow} from "@tauri-apps/api/window";

const minimizeWindow = () => {
    appWindow.minimize();
};

const closeWindow = () => {
    appWindow.close();
};

const hideWindow = () => {
    appWindow.hide();
};

export {
    minimizeWindow,
    closeWindow,
    hideWindow
}