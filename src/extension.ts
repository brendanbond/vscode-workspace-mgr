import path from "path";
import * as vscode from "vscode";

const EXTENSION_NAME = "workspace-mgr";

function getParentDirectories() {
  let parentDirectories: string[] | undefined = vscode.workspace
    .getConfiguration(EXTENSION_NAME)
    .get("parentDirectories");
  if (parentDirectories) {
    return parentDirectories;
  } else {
    throw new Error(
      "Workspace Manager: Parent folder(s) not found, please set workspace-mgr.projectDirectories in your settings"
    );
  }
}

function getQuickPickItems(directory: string): Thenable<string[]> {
  return vscode.workspace.fs
    .readDirectory(vscode.Uri.file(directory))
    .then((result) =>
      result
        .filter(([name, fileType]) => fileType === vscode.FileType.Directory)
        .map(([dirName]) => dirName)
    );
}

class WorkspaceFolderUpdate {
  private static instance: WorkspaceFolderUpdate;
  private isWaiting: boolean;
  private listeners: vscode.Disposable[];

  private constructor() {
    this.isWaiting = false;
    this.listeners = [];
  }

  public static getInstance(): WorkspaceFolderUpdate {
    if (!WorkspaceFolderUpdate.instance) {
      WorkspaceFolderUpdate.instance = new WorkspaceFolderUpdate();
    }
    return WorkspaceFolderUpdate.instance;
  }

  add(uri: vscode.Uri) {
    if (this.isWaiting) {
      vscode.window.showInformationMessage(
        "Can't add another workspace update; wait until all other updates are completed"
      );
      return;
    }
    this.isWaiting = true;
    return new Promise<void>((resolve) => {
      vscode.workspace.updateWorkspaceFolders(
        vscode.workspace.workspaceFolders
          ? vscode.workspace.workspaceFolders.length
          : 0,
        null,
        { uri }
      );
      const listener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.isWaiting = false;
        listener.dispose();
        resolve();
      });
    });
  }

  destroy() {
    this.listeners.forEach((listener) => listener.dispose());
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const parentDirectories = getParentDirectories();
  const updateFactory = WorkspaceFolderUpdate.getInstance();
  let add = vscode.commands.registerCommand(`${EXTENSION_NAME}.add`, () => {
    const parentDirectoryPromise =
      vscode.window.showQuickPick(parentDirectories);
    const selectedItemPromise = parentDirectoryPromise
      .then((parentDir) => (parentDir ? getQuickPickItems(parentDir) : []))
      .then((items) => vscode.window.showQuickPick(items));
    Promise.all([parentDirectoryPromise, selectedItemPromise])
      .then(([parentDirectory, selectedItem]) => {
        if (parentDirectory && selectedItem) {
          let uri = vscode.Uri.file(path.join(parentDirectory, selectedItem));
          updateFactory.add(uri);
        }
      })
      .catch((err) => vscode.window.showErrorMessage(err));
  });

  let remove = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.remove`,
    () => {
      vscode.commands.executeCommand("workbench.action.removeRootFolder");
    }
  );

  context.subscriptions.push(add, remove);
}

// this method is called when your extension is deactivated
export function deactivate() {
  const updateFactory = WorkspaceFolderUpdate.getInstance();
  updateFactory.destroy();
}
