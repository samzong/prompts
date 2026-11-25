# Changelog

## [0.1.9] (2025-06-11)


### Features

* improve macOS release artifacts naming and paths


### Fixes

* correct version reference in release workflow artifact naming

## [0.1.8] (2025-06-11)


### Features

* enhance updater with platform-specific download URLs

## [0.1.6] (2025-06-11)


### Features

* **tauri-updater:** add Tauri updater support with GitHub Release integration


### Fixes

* update Makefile to download correct DMG files and improve SHA256 update process

## [0.1.2] (2025-06-09)


### Features

* **tauri:** update prompts version and enhance app metadata and build profiles
* **quickPicker:** implement window position management and dynamic height calculation


### Fixes

* **release:** update build command from 'make build-app' to 'make build-all'


### Documentation

* **github:** add comprehensive Copilot instructions and development guidelines
* **project:** add CLAUDE.md with project overview and development guide
* **readme:** expand product features and system integration details
* **readme:** update search feature descriptions for real-time results and filtering

## [0.1.1] (2025-06-06)


### Features

* **icons:** add and update application icons for multiple platforms.


### Other

* Update README.md

add video.

## [0.1.0] (2025-06-05)


### Other

* Init Commit.
* Add Makefile for Prompt Snippets Manager with build and development commands
* Refactor project structure to transition from Tauri + Leptos to Tauri + React + TypeScript.
* Add Makefile for project automation, including build, development, and testing commands for Tauri + React + TypeScript application.
* Update package dependencies and project metadata; add README in Chinese for Prompt Snippets Manager.
* Refactor project configuration and structure for Prompt Snippets Manager; update package dependencies, add Tailwind CSS support, and implement Zustand for state management.
* Remove unused Tailwind CSS dependencies and update PostCSS configuration to use the correct Tailwind CSS plugin.
* Enhance Makefile for macOS architecture detection and build process; update package dependencies for Tauri API, and implement new layout components for improved UI in Prompt Snippets Manager.
* Update package dependencies for improved functionality; implement new UI components including InputModal and Toast for enhanced user experience in Prompt Snippets Manager.
* Implement folder and tag management features in App component; add confirmation modals for deletion and renaming, and integrate context menu for user interactions in Navigation component.
* Add clipboard manager plugin and update related components for clipboard functionality; refactor tag management in PromptEditor and enhance error handling in copy operations.
* Refactor PromptDetailView layout for dynamic content display; enhance styling and spacing for improved readability and maintainability.
* Add new UI components for enhanced user interaction; implement toolbar and button components, integrate keyboard shortcuts, and update styles for improved usability in Prompt management.
* Add global shortcut plugin and integrate Quick Picker feature; update package configurations, add new HTML and TypeScript files for Quick Picker UI, and enhance README for system integration details.
* Enhance QuickPicker component with clipboard functionality; add feedback for copied items, improve UI responsiveness, and refactor code for better maintainability. Adjust window size settings in Tauri for improved user experience.
* Add settings management feature with UI for global shortcuts and appearance preferences; implement settings persistence and reset functionality, and integrate new components for improved user experience.
* Refactor keyboard event handling in QuickPicker component; utilize useCallback for stable function references, add window-level ESC key handling for improved user experience, and implement a delay before hiding the QuickPicker window to ensure proper ESC key processing.
* Update project name and descriptions to reflect new branding; change references from "Prompt Snippets Manager" to "Prompts" across package.json, TitleBar component, and Tauri configuration files for consistency.
* Add Dockerfile for Linux cross-compilation and update Makefile for Docker build support; enhance .gitignore to exclude .xwin-cache files.
