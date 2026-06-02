// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
#[tauri::command]
fn saludar(nombre: &str) -> String {
    format!("Hola, {}!", nombre)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            window.set_fullscreen(true).unwrap();
            window.set_decorations(false).unwrap(); // opcional (modo POS)
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error");
}