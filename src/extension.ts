'use strict';

import { ExtensionContext, commands, window, workspace } from 'vscode';

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
            config.update('terminal.integrated.fontSize', newSize, true);
            return config.update('editor.fontSize', newSize, true);
        }
    });
    const decreaseSizeCommand = commands.registerCommand('fontshortcuts.decreaseFontSize', () => {
        const config = workspace.getConfiguration();
        const fontSize = config.get<number>('editor.fontSize');
        const newSize = Math.max(minFontSize, fontSize - 1);
        if (newSize !== fontSize) {
            config.update('terminal.integrated.fontSize', newSize, true);
            return config.update('editor.fontSize', newSize, true);
        }
    });
    const resetSizeCommand = commands.registerCommand('fontshortcuts.resetFontSize', () => {
        // Check whether an override for the default font size exists
        const defaultFontSize = workspace.getConfiguration("fontshortcuts").get('defaultFontSize') as number;
        console.log(defaultFontSize);
        if (defaultFontSize) {
            // Check whether the setting is a valid value
            // TODO Continue
            if (Number.isSafeInteger(defaultFontSize)
                && defaultFontSize >= minFontSize
                && defaultFontSize <= maxFontSize
            ) {
                workspace.getConfiguration().update('terminal.integrated.fontSize', defaultFontSize, true);
                return workspace.getConfiguration().update('editor.fontSize', defaultFontSize, true);
            } else {
                // TODO: Display error notification
                window.showErrorMessage(`Cannot set default font size to "${defaultFontSize}". Please set it to an integer between ${minFontSize} and ${maxFontSize} in your user settings.`);
            }
        } else {
            // No override is set, remove the fontSize setting to let VSCode set the default font size
            workspace.getConfiguration().update('terminal.integrated.fontSize', undefined, true)
            return workspace.getConfiguration().update('editor.fontSize', undefined, true)
                // Swallow exceptions if fontSize has already been reset
                .then(() => { }, () => { });
        }
    });

    context.subscriptions.push(increaseSizeCommand);
    context.subscriptions.push(decreaseSizeCommand);
    context.subscriptions.push(resetSizeCommand);
}

export function deactivate() { }
