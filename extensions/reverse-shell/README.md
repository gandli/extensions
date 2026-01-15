# Reverse Shell Generator

<div align="center">

![Extension Icon](./assets/extension-icon.png)

A powerful Raycast extension for quickly generating various reverse shell commands.

[![Raycast](https://img.shields.io/badge/Raycast-Extension-red.svg)](https://www.raycast.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

## ✨ Features

- 🚀 **40+ Shell Types** - Support for multiple programming languages and tools
- 🎯 **Smart Categorization** - Grouped by tool type, programming language, and operating system
- 🔍 **OS Filtering** - Quickly filter commands compatible with Linux, Windows, macOS
- 📋 **One-Click Copy** - Support for raw commands, URL encoding, Base64 encoding
- 💾 **Configuration Persistence** - Automatically save last used IP and port
- 📝 **Listener Commands** - Provides corresponding listener setup commands
- 💿 **Export Functionality** - Save commands as script files
- 🎨 **Detailed Preview** - View command details, descriptions, and usage instructions

## � Screenshots

<div align="center">

### Main Interface

![Main Interface](./metadata/reverse-shell-generator-1.png)

### Command List with OS Filtering

![Command List](./metadata/reverse-shell-generator-2.png)

### Detailed Command Preview

![Command Details](./metadata/reverse-shell-generator-3.png)

</div>

## �📦 Supported Shell Types

### Shell Tools

- Bash (TCP/UDP/Exec/196)
- Netcat (Standard/FIFO/OpenBSD)
- Ncat
- Socat
- Telnet

### Scripting Languages

- Python (2/3/Shortest/Windows)
- PHP (exec/system/passthru/shell_exec)
- Perl
- Ruby
- Node.js
- Lua
- Awk

### Compiled Languages

- Golang
- Rust
- Java

### Windows

- PowerShell (#1/#2/Base64)
- C# TCP Client

### MSFVenom Payloads

- Linux (x64/x86)
- Windows (x64/x86)
- macOS

### Install from Raycast Store

search "reverse-shell-generator" in the Raycast Store

## 🎯 Usage

1. Open the extension in Raycast (shortcut: `⌘ + Space`)
2. Type "Generate Reverse Shell"
3. Enter target IP address and port
4. Browse and select the desired shell type
5. Use keyboard shortcuts for quick actions:
   - `⌘ + C` - Copy command
   - `⌘ + ⇧ + U` - Copy URL encoded
   - `⌘ + ⇧ + B` - Copy Base64 encoded
   - `⌘ + ⇧ + L` - Copy listener command
   - `⌘ + S` - Save to file
   - `⌘ + R` - Re-enter IP/port

## 🔍 Feature Showcase

### OS Filtering

Use the dropdown menu to quickly filter shells for specific operating systems:

- 🐧 Linux
- 🪟 Windows
- 🍎 macOS

### Encoding Options

Support for multiple encoding formats to bypass filters:

- Raw command
- URL encoding
- Base64 encoding

### Sorting Options

Sort commands by different dimensions:

- `⌘ + ⇧ + 1` - Sort by category
- `⌘ + ⇧ + 2` - Sort by name
- `⌘ + ⇧ + 3` - Sort by OS

## ⚠️ Security Warning

> **Important**: This tool is for authorized security testing and educational purposes only.

- ✅ **Legitimate Use Cases**:
  - Authorized penetration testing
  - CTF competitions
  - Security research and learning
  - Red team exercises

- ❌ **Prohibited Use Cases**:
  - Unauthorized system access
  - Malicious attacks
  - Illegal intrusion

**Users are solely responsible for any legal consequences arising from the use of this tool.**

## 🛠️ Tech Stack

- [Raycast API](https://developers.raycast.com/) - Extension framework
- [React](https://reactjs.org/) - UI components
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Bun](https://bun.sh/) - Package management and build tool

## 📝 Development

### Project Structure

```
reverse-shell/
├── src/
│   └── generate-reverse-shell.tsx  # Main logic
├── assets/
│   └── extension-icon.png          # Extension icon
├── package.json                     # Project configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Project documentation
```

### Running Linting

```bash
# Check code style
bun run lint

# Auto-fix issues
bun run fix-lint
```

### Building

```bash
# Build production version
bun run build

# Publish to Raycast Store
bun run publish
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [RevShells.com](https://www.revshells.com/)
- Thanks to [Raycast](https://www.raycast.com/) for providing an excellent platform

## 📮 Contact

For questions or suggestions, please contact us through:

- Submit an [Issue](https://github.com/yourusername/reverse-shell/issues)
- Email: <your.email@example.com>

---

<div align="center">
Made with ❤️ for the Security Community
</div>
