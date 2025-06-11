// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::collections::HashMap;
use std::sync::{Mutex, OnceLock};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, WindowEvent};

// 全局状态存储当前注册的快捷键
static REGISTERED_SHORTCUTS: OnceLock<Mutex<HashMap<String, String>>> = OnceLock::new();

#[tauri::command]
async fn update_global_shortcut(
    app: tauri::AppHandle,
    shortcut: String,
    enabled: bool,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri_plugin_global_shortcut::GlobalShortcutExt;

        // 获取或初始化全局状态
        let registered_mutex = REGISTERED_SHORTCUTS.get_or_init(|| Mutex::new(HashMap::new()));

        // 解注册所有现有快捷键
        let mut registered = registered_mutex.lock().map_err(|e| e.to_string())?;
        for (_, old_shortcut) in registered.iter() {
            // 解析快捷键字符串
            if let Ok(parsed_shortcut) = parse_shortcut_string(old_shortcut) {
                let _ = app.global_shortcut().unregister(parsed_shortcut);
            }
        }
        registered.clear();

        // 如果启用，注册新的快捷键
        if enabled && !shortcut.is_empty() {
            match parse_shortcut_string(&shortcut) {
                Ok(parsed_shortcut) => {
                    app.global_shortcut()
                        .register(parsed_shortcut)
                        .map_err(|e| format!("Failed to register shortcut: {}", e))?;
                    registered.insert("quickPicker".to_string(), shortcut);
                }
                Err(e) => return Err(format!("Invalid shortcut format: {}", e)),
            }
        }
    }

    Ok(())
}

// 解析快捷键字符串
#[cfg(desktop)]
fn parse_shortcut_string(
    shortcut_str: &str,
) -> Result<tauri_plugin_global_shortcut::Shortcut, String> {
    use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut};

    let parts: Vec<&str> = shortcut_str.split('+').collect();
    if parts.is_empty() {
        return Err("Empty shortcut".to_string());
    }

    let mut modifiers = Modifiers::empty();
    let key_str = parts.last().unwrap().trim();

    for part in &parts[..parts.len() - 1] {
        match part.trim() {
            "CommandOrControl" | "Cmd" | "Command" => {
                #[cfg(target_os = "macos")]
                {
                    modifiers |= Modifiers::META;
                }
                #[cfg(not(target_os = "macos"))]
                {
                    modifiers |= Modifiers::CONTROL;
                }
            }
            "Ctrl" | "Control" => modifiers |= Modifiers::CONTROL,
            "Alt" | "Option" => modifiers |= Modifiers::ALT,
            "Shift" => modifiers |= Modifiers::SHIFT,
            "Meta" => modifiers |= Modifiers::META,
            _ => return Err(format!("Unknown modifier: {}", part.trim())),
        }
    }

    let code = match key_str.to_uppercase().as_str() {
        "A" => Code::KeyA,
        "B" => Code::KeyB,
        "C" => Code::KeyC,
        "D" => Code::KeyD,
        "E" => Code::KeyE,
        "F" => Code::KeyF,
        "G" => Code::KeyG,
        "H" => Code::KeyH,
        "I" => Code::KeyI,
        "J" => Code::KeyJ,
        "K" => Code::KeyK,
        "L" => Code::KeyL,
        "M" => Code::KeyM,
        "N" => Code::KeyN,
        "O" => Code::KeyO,
        "P" => Code::KeyP,
        "Q" => Code::KeyQ,
        "R" => Code::KeyR,
        "S" => Code::KeyS,
        "T" => Code::KeyT,
        "U" => Code::KeyU,
        "V" => Code::KeyV,
        "W" => Code::KeyW,
        "X" => Code::KeyX,
        "Y" => Code::KeyY,
        "Z" => Code::KeyZ,
        "0" => Code::Digit0,
        "1" => Code::Digit1,
        "2" => Code::Digit2,
        "3" => Code::Digit3,
        "4" => Code::Digit4,
        "5" => Code::Digit5,
        "6" => Code::Digit6,
        "7" => Code::Digit7,
        "8" => Code::Digit8,
        "9" => Code::Digit9,
        "SPACE" => Code::Space,
        "ENTER" => Code::Enter,
        "TAB" => Code::Tab,
        "ESCAPE" => Code::Escape,
        "BACKSPACE" => Code::Backspace,
        "DELETE" => Code::Delete,
        _ => return Err(format!("Unknown key: {}", key_str)),
    };

    Ok(Shortcut::new(Some(modifiers), code))
}

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
            WebviewUrl::App("quick_picker.html".into()),
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
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            toggle_quick_picker,
            toggle_main_window,
            quit_app,
            update_global_shortcut
        ])
        .setup(|app| {
            // 注册全局快捷键
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

                // 注册快捷键插件
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

                // 注册默认快捷键
                if let Ok(default_shortcut) = parse_shortcut_string("CommandOrControl+Shift+P") {
                    let _ = app.global_shortcut().register(default_shortcut);

                    // 初始化注册表
                    let registered_mutex =
                        REGISTERED_SHORTCUTS.get_or_init(|| Mutex::new(HashMap::new()));
                    if let Ok(mut registered) = registered_mutex.lock() {
                        registered.insert(
                            "quickPicker".to_string(),
                            "CommandOrControl+Shift+P".to_string(),
                        );
                    }
                }
            }

            // 设置系统托盘
            let app_handle = app.handle().clone();

            // 加载托盘图标
            let icon = app
                .default_window_icon()
                .ok_or("Failed to get default window icon")?;

            let _tray = TrayIconBuilder::with_id("main-tray")
                .tooltip("Prompts")
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
                // 如果 quick_picker 失去焦点，延迟隐藏它，给React组件时间处理ESC键
                if !focused && window.label() == "quick_picker" {
                    let window_clone = window.clone();
                    std::thread::spawn(move || {
                        // 延迟100ms，让React组件的键盘事件处理器有机会执行
                        std::thread::sleep(std::time::Duration::from_millis(100));
                        // 再次检查窗口是否仍然失去焦点
                        if let Ok(is_focused) = window_clone.is_focused() {
                            if !is_focused {
                                let _ = window_clone.hide();
                            }
                        }
                    });
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
