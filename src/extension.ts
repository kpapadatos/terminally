import { sleep } from '@lunarade/xtools';
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

				for (const terminalConfig of group.terminals) {
					const location: any = previousTerminal ? { parentTerminal: previousTerminal } : undefined;
					const isInGroup = !!previousTerminal as any;
					const terminal =
						terminalConfig.jsDebug ?
							await createDebugTerminal(terminalConfig, isInGroup) :
							vscode.window.createTerminal({
								name: terminalConfig.title,
								location
							});

					if (terminal) {
						terminal.show();

						if (terminalConfig.command) {
							terminal.sendText(terminalConfig.command);
						}

						previousTerminal = terminal;
					}
				}
			}
		} catch (error) {
			vscode.window.showErrorMessage('Could not read the .terminally configuration file.');
		}
	});

	context.subscriptions.push(disposable);

	offerToApplyConfig();
}

export function deactivate() { }

async function offerToApplyConfig() {
	const result = await vscode.window.showInformationMessage('Terminally: Do you want to open terminals?', 'Yes', 'No');

	if (result === 'Yes') {
		vscode.commands.executeCommand('terminally.applyWorkspace');
	}
}

async function createDebugTerminal(config: ITerminallyTerminal, splitActive?: boolean) {
	if (splitActive) {
		await splitActiveTerminal();
	} else {
		await vscode.commands.executeCommand('extension.js-debug.createDebuggerTerminal');
	}

	const term = vscode.window.terminals[vscode.window.terminals.length - 1];
	term.show();

	await sleep(1500);
	await vscode.commands.executeCommand('workbench.action.terminal.renameWithArg', {
		name: config.title
	});

	return vscode.window.activeTerminal;
}

async function splitActiveTerminal() {
	await vscode.commands.executeCommand('workbench.action.terminal.split', {
		config: {
			extensionIdentifier: 'ms-vscode.js-debug',
			id: 'extension.js-debug.debugTerminal'
		},
		location: {
			splitActiveTerminal: true
		}
	});
}

interface ITerminallyOptions {
	groups: ITerminallyGroup[];
}

interface ITerminallyGroup {
	terminals: ITerminallyTerminal[];
}

interface ITerminallyTerminal {
	title: string;
	command?: string;
	jsDebug?: boolean;
}