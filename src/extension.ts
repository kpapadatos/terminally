import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('terminally.applyWorkspace', async () => {
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder is open. Please open a workspace folder.');
			return;
		}

		const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
		const configFile = path.join(workspaceFolder.fsPath, '.terminally');

		try {
			const configFileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(configFile));
			const config = JSON.parse(configFileContent.toString()) as ITerminallyOptions;

			for (const group of config.groups) {
				let previousTerminal: vscode.Terminal | undefined = undefined;

				for (const terminal of group.terminals) {
					const location: any = previousTerminal ? { parentTerminal: previousTerminal } : undefined;
					const terminalInstance = vscode.window.createTerminal({
						name: terminal.title,
						location
					});

					terminalInstance.show();

					if (terminal.command) {
						terminalInstance.sendText(terminal.command);
					}

					previousTerminal = terminalInstance;
				}
			}
		} catch (error) {
			vscode.window.showErrorMessage('Could not read the .terminally configuration file.');
		}

	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

interface ITerminallyOptions {
	groups: ITerminallyGroup[];
}

interface ITerminallyGroup {
	terminals: ITerminallyTerminal[];
}

interface ITerminallyTerminal {
	title: string;
	command?: string;
}