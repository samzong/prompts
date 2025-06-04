# Prompt Snippets Manager - Makefile
# Tauri + Leptos Desktop Application

.PHONY: help dev build clean install-deps check test frontend-dev frontend-build tauri-dev tauri-build

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

## Show this help message
help:
	@echo "$(CYAN)Prompt Snippets Manager - Available Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Development:$(RESET)"
	@echo "  $(YELLOW)make dev$(RESET)          - Start development server with hot reload"
	@echo "  $(YELLOW)make frontend-dev$(RESET) - Start frontend only (browser mode)"
	@echo "  $(YELLOW)make tauri-dev$(RESET)    - Start Tauri backend only"
	@echo ""
	@echo "$(GREEN)Building:$(RESET)"
	@echo "  $(YELLOW)make build$(RESET)        - Build release version for distribution"
	@echo "  $(YELLOW)make frontend-build$(RESET) - Build frontend only"
	@echo "  $(YELLOW)make tauri-build$(RESET)  - Build Tauri app only"
	@echo ""
	@echo "$(GREEN)Maintenance:$(RESET)"
	@echo "  $(YELLOW)make clean$(RESET)        - Clean all build artifacts"
	@echo "  $(YELLOW)make install-deps$(RESET) - Install all required dependencies"
	@echo "  $(YELLOW)make check$(RESET)        - Run code checks and formatting"
	@echo "  $(YELLOW)make test$(RESET)         - Run all tests"
	@echo ""
	@echo "$(GREEN)Utilities:$(RESET)"
	@echo "  $(YELLOW)make help$(RESET)         - Show this help message"

## Start development server with hot reload (full Tauri app)
dev:
	@echo "$(GREEN)Starting Tauri development server...$(RESET)"
	@echo "$(YELLOW)Frontend will be available at http://localhost:1420$(RESET)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(RESET)"
	cargo tauri dev

## Start frontend development server only (browser mode)
frontend-dev:
	@echo "$(GREEN)Starting frontend development server...$(RESET)"
	@echo "$(YELLOW)Frontend will be available at http://localhost:1420$(RESET)"
	@echo "$(YELLOW)Note: Tauri backend features won't work in this mode$(RESET)"
	trunk serve

## Start Tauri backend development only
tauri-dev:
	@echo "$(GREEN)Starting Tauri backend...$(RESET)"
	cd src-tauri && cargo run

## Build release version for distribution
build:
	@echo "$(GREEN)Building release version...$(RESET)"
	@echo "$(YELLOW)This may take several minutes...$(RESET)"
	cargo tauri build
	@echo "$(GREEN)✓ Build complete! Check src-tauri/target/release/bundle/$(RESET)"

## Build frontend only
frontend-build:
	@echo "$(GREEN)Building frontend...$(RESET)"
	trunk build --release
	@echo "$(GREEN)✓ Frontend build complete!$(RESET)"

## Build Tauri app only
tauri-build:
	@echo "$(GREEN)Building Tauri backend...$(RESET)"
	cd src-tauri && cargo build --release
	@echo "$(GREEN)✓ Tauri build complete!$(RESET)"

## Clean all build artifacts
clean:
	@echo "$(GREEN)Cleaning build artifacts...$(RESET)"
	@echo "$(YELLOW)Cleaning Rust target directories...$(RESET)"
	cargo clean
	cd src-tauri && cargo clean
	@echo "$(YELLOW)Cleaning Trunk dist directory...$(RESET)"
	rm -rf dist/
	@echo "$(YELLOW)Cleaning node modules (if any)...$(RESET)"
	rm -rf node_modules/
	@echo "$(GREEN)✓ Clean complete!$(RESET)"

## Install all required dependencies
install-deps:
	@echo "$(GREEN)Installing dependencies...$(RESET)"
	@echo "$(YELLOW)Checking Rust installation...$(RESET)"
	@command -v rustc >/dev/null 2>&1 || { echo "$(RED)Error: Rust is not installed. Please install Rust first.$(RESET)"; exit 1; }
	@echo "$(YELLOW)Adding WebAssembly target...$(RESET)"
	rustup target add wasm32-unknown-unknown
	@echo "$(YELLOW)Installing Trunk...$(RESET)"
	cargo install trunk --locked
	@echo "$(YELLOW)Installing Tauri CLI...$(RESET)"
	cargo install tauri-cli --version "^2.0" --locked
	@echo "$(GREEN)✓ All dependencies installed!$(RESET)"

## Run code checks and formatting
check:
	@echo "$(GREEN)Running code checks...$(RESET)"
	@echo "$(YELLOW)Checking frontend code...$(RESET)"
	cargo check
	@echo "$(YELLOW)Checking backend code...$(RESET)"
	cd src-tauri && cargo check
	@echo "$(YELLOW)Formatting code...$(RESET)"
	cargo fmt
	cd src-tauri && cargo fmt
	@echo "$(YELLOW)Running clippy lints...$(RESET)"
	cargo clippy -- -D warnings
	cd src-tauri && cargo clippy -- -D warnings
	@echo "$(GREEN)✓ All checks passed!$(RESET)"

## Run all tests
test:
	@echo "$(GREEN)Running tests...$(RESET)"
	@echo "$(YELLOW)Testing frontend...$(RESET)"
	cargo test
	@echo "$(YELLOW)Testing backend...$(RESET)"
	cd src-tauri && cargo test
	@echo "$(GREEN)✓ All tests passed!$(RESET)"

## Check if required tools are installed
check-deps:
	@echo "$(GREEN)Checking dependencies...$(RESET)"
	@command -v rustc >/dev/null 2>&1 || { echo "$(RED)✗ Rust is not installed$(RESET)"; exit 1; }
	@command -v cargo >/dev/null 2>&1 || { echo "$(RED)✗ Cargo is not installed$(RESET)"; exit 1; }
	@command -v trunk >/dev/null 2>&1 || { echo "$(RED)✗ Trunk is not installed. Run 'make install-deps'$(RESET)"; exit 1; }
	@command -v cargo-tauri >/dev/null 2>&1 || { echo "$(RED)✗ Tauri CLI is not installed. Run 'make install-deps'$(RESET)"; exit 1; }
	@echo "$(GREEN)✓ All dependencies are installed!$(RESET)" 