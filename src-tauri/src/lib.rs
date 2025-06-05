// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{WebviewUrl, WebviewWindowBuilder, Manager, WindowEvent};
use tauri::tray::{TrayIconBuilder, MouseButton, MouseButtonState};

#[tauri::command]
async fn quit_app(app: tauri::AppHandle) -> Result<(), String> {
    app.exit(0);
    Ok(())
}

#[tauri::command]
async fn toggle_main_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let is_visible = window.is_visible().map_err(|e| e.to_string())?;
        if is_visible {
            // 如果窗口可见，则隐藏它
            window.hide().map_err(|e| e.to_string())?;
        } else {
            // 如果窗口隐藏，则显示并聚焦它
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
async fn toggle_quick_picker(app: tauri::AppHandle) -> Result<(), String> {
    // 检查 quick_picker 窗口是否存在
    if let Some(window) = app.get_webview_window("quick_picker") {
        // 如果窗口存在，检查是否可见
        let is_visible = window.is_visible().map_err(|e| e.to_string())?;
        if is_visible {
            // 隐藏窗口
            window.hide().map_err(|e| e.to_string())?;
        } else {
            // 显示并聚焦窗口
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    } else {
        // 创建新的 quick_picker 窗口
        let window = WebviewWindowBuilder::new(
            &app,
            "quick_picker",
            WebviewUrl::App("quick_picker.html".into())
        )
        .title("Quick Picker")
        .inner_size(500.0, 300.0)
        .min_inner_size(400.0, 200.0)
        .center()
        .resizable(true)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .build()
        .map_err(|e| e.to_string())?;

        // 设置窗口聚焦
        window.set_focus().map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())

        .invoke_handler(tauri::generate_handler![toggle_quick_picker, toggle_main_window, quit_app])
        .setup(|app| {
            // 注册全局快捷键
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
                
                let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyP);
                
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app, _shortcut, event| {
                            if event.state() == ShortcutState::Pressed {
                                let app_handle = app.clone();
                                tauri::async_runtime::spawn(async move {
                                    if let Err(e) = toggle_quick_picker(app_handle).await {
                                        eprintln!("Failed to toggle quick picker: {}", e);
                                    }
                                });
                            }
                        })
                        .build(),
                )?;
                
                app.global_shortcut().register(shortcut)?;
            }

            // 设置系统托盘
            let app_handle = app.handle().clone();
            
            // 加载托盘图标
            let icon = app.default_window_icon()
                .ok_or("Failed to get default window icon")?;
            
            let _tray = TrayIconBuilder::with_id("main-tray")
                .tooltip("Prompt Snippets Manager")
                .icon(icon.clone())
                .on_tray_icon_event(move |_tray, event| {
                    use tauri::tray::TrayIconEvent;
                    
                    match event {
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            // 左键点击：打开 QuickPicker
                            let app_handle = app_handle.clone();
                            tauri::async_runtime::spawn(async move {
                                if let Err(e) = toggle_quick_picker(app_handle).await {
                                    eprintln!("Failed to toggle quick picker from tray: {}", e);
                                }
                            });
                        }
                        TrayIconEvent::Click {
                            button: MouseButton::Right,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            // 右键点击：切换主窗口显示状态
                            let app_handle = app_handle.clone();
                            tauri::async_runtime::spawn(async move {
                                if let Err(e) = toggle_main_window(app_handle).await {
                                    eprintln!("Failed to toggle main window from tray: {}", e);
                                }
                            });
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::Focused(focused) = event {
                // 如果 quick_picker 失去焦点，隐藏它
                if !focused && window.label() == "quick_picker" {
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
