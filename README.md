# Workspace Manager

A very simple VSCode extension that allows quick add/removal of folders from multiple parent directories to a workspace.

## Extension Commands

This extension contributes the following command:

- `workspace-mgr.add`
- `workspace-mgr.remove`

You can invoke these commands by using the Command Palette (Shift + Cmd + P on a Mac) and choosing `Workspace Manager: [Add/Remove] Project` or by binding keys to each (see below for the provided keybindings).

## Extension Settings

This extension contributes the following setting:

- `workspace-mgr.projectDirectories`: An array of directories from which Workspace Manager looks for project folders.

## Keybindings

This extension contributes the following keybindings:

```json
{
  "key": "ctrl+;",
  "mac": "cmd+;",
  "command": "workspace-mgr.add",
  "when": "!inQuickOpen"
},
{
  "key": "ctrl+'",
  "mac": "cmd+'",
  "command": "workspace-mgr.remove",
  "when": "!inQuickOpen"
},
```

## Installation

To build the .VSIX file from source, you'll need the `vcse` package:

```
npm install -g vcse
```

You can then build your .VSIX file by invoking the `package` command in the root directory:

```
vsce package
```

Finally, you can install the extension in VSCode by invoking the `Extensions: Install from VSIX...` command in the Command Palette (Shift + Cmd + P on a Mac) and choosing the newly created .VSIX file from the dialog.
