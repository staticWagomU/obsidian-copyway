# Copyway

[![License: 0BSD](https://img.shields.io/badge/License-0BSD-blue.svg)](https://opensource.org/licenses/0BSD)

[日本語](README.ja.md)

An [Obsidian](https://obsidian.md) plugin that allows you to quickly copy active files to pre-configured destinations outside your vault.

## Features

- **Quick File Copy**: Copy the currently active file to external destinations with a single command
- **Multiple Destinations**: Configure multiple copy destinations and choose from a modal when needed
- **Overwrite Control**: Set whether files should be automatically overwritten or prompt for confirmation
- **Ribbon Icon**: Access the copy command directly from the sidebar ribbon
- **Smart Conflict Handling**: When a file exists and overwrite is disabled, choose to overwrite, rename, or cancel

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Copyway"
4. Install the plugin and enable it

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/staticWagomU/obsidian-copyway/releases) page
2. Extract the files into your vault's `.obsidian/plugins/copyway/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## Usage

### Setting Up Destinations

1. Open Settings → Copyway
2. Click "Add" to create a new destination
3. Configure each destination:
   - **Path**: The absolute path to the destination folder (e.g., `/Users/you/Documents/backup`)
   - **Description**: A friendly name for the destination (e.g., "Backup Folder")
   - **Overwrite Toggle**: Enable to automatically overwrite existing files

### Copying Files

There are two ways to copy the active file:

1. **Command Palette**: Open the command palette (`Cmd/Ctrl + P`) and search for "Copy file to destination"
2. **Ribbon Icon**: Click the copy icon in the left sidebar

### Behavior

- **Single Destination**: The file is copied immediately
- **Multiple Destinations**: A modal appears to select the target destination
- **File Exists (Overwrite Disabled)**: A confirmation modal appears with options:
  - **Overwrite**: Replace the existing file
  - **Rename**: Copy with a numbered suffix (e.g., `note_1.md`)
  - **Cancel**: Abort the copy operation

## Configuration

| Setting | Description |
|---------|-------------|
| Path | Absolute path to the destination folder |
| Description | Display name shown in the destination selector |
| Overwrite | When enabled, existing files are overwritten without confirmation |

## Development

```bash
# Install dependencies
pnpm install

# Development build with watch mode
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Run all validations
pnpm validate
```

## License

[0BSD](LICENSE) - Free for any use.

## Author

[wagomu](https://github.com/staticWagomU)
