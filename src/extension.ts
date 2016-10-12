'use strict';
import { ExtensionContext, commands, workspace } from 'vscode';

// Values from common editor config:
// https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/config/commonEditorConfig.ts#L521
const minFontSize = 1;
const maxFontSize = 100;

export function activate(context: ExtensionContext) {
    const increaseSizeCommand = commands.registerCommand('fontshortcuts.increaseFontSize', () => {
        const config = workspace.getConfiguration();
        const fontSize = config.get<number>('editor.fontSize');
        const newSize = Math.min(maxFontSize, fontSize + 1);
        if (newSize !== fontSize) {
            return config.update('editor.fontSize', newSize, true);
        }
    });
    const decreaseSizeCommand = commands.registerCommand('fontshortcuts.decreaseFontSize', () => {
        const config = workspace.getConfiguration();
        const fontSize = config.get<number>('editor.fontSize');
        const newSize = Math.max(minFontSize, fontSize - 1);
        if (newSize !== fontSize) {
            return config.update('editor.fontSize', newSize, true);
        }
    });
    const resetSizeCommand = commands.registerCommand('fontshortcuts.resetFontSize', () => {
        return workspace.getConfiguration().update('editor.fontSize', undefined, true)
            // Swallow exceptions if fontSize has already been reset
            .then(() => { }, () => { });
    });

    context.subscriptions.push(increaseSizeCommand);
    context.subscriptions.push(decreaseSizeCommand);
    context.subscriptions.push(resetSizeCommand);
}

export function deactivate() { }
