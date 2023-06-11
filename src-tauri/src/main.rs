// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::save_chat_history;
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu};


fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(quit);

    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(tray)
        .on_system_tray_event(|_app, event| match event {
            SystemTrayEvent::MenuItemClick{id, ..} => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![save_chat_history,])
        .run(tauri::generate_context!())
        .expect("error while running tauri app!")
}
