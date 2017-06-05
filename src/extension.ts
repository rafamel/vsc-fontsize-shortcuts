'use strict';

import { ExtensionContext, commands, window, workspace } from 'vscode';

// Values from common editor config:
// https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/config/commonEditorConfig.ts#L521
const minFontSize = 1;
const maxFontSize = 100;

export function activate(context: ExtensionContext) {

    const increaseDecrease = (increase: boolean) => {
        const sumFontSize = (current: number, step: number) => {
            let newSize = (increase) ? Math.min(maxFontSize, current + step) : Math.max(minFontSize, current - step);
            return Math.round(newSize * 10) / 10;
        }
        const config = workspace.getConfiguration(),
            step = config.get<number>('fontshortcuts.step'),
            fontSize = config.get<number>('editor.fontSize'),
            termFontSize = config.get<number>('editor.fontSize'),
            newSize = sumFontSize(fontSize, step),
            newTermSize = sumFontSize(termFontSize, step);
        if (newSize !== fontSize) {
            config.update('editor.fontSize', newSize, true);
        }
        if (newTermSize !== termFontSize) {
            config.update('terminal.integrated.fontSize', newTermSize, true);
        }
    }
    const increaseSizeCommand = commands.registerCommand('fontshortcuts.increaseFontSize', () => {
        increaseDecrease(true);
    });
    const decreaseSizeCommand = commands.registerCommand('fontshortcuts.decreaseFontSize', () => {
        increaseDecrease(false);
    });
    const resetSizeCommand = commands.registerCommand('fontshortcuts.resetFontSize', async () => {
        // Check whether an override for the default font size exists
        let defaultFontSize = workspace.getConfiguration("fontshortcuts").get('defaultFontSize') as number;
        if (defaultFontSize) {
            // Check whether the setting is a valid value
            if (defaultFontSize >= minFontSize
                && defaultFontSize <= maxFontSize
            ) {
                defaultFontSize = Math.round(defaultFontSize * 10) / 10;
                try {
                    await workspace.getConfiguration().update('terminal.integrated.fontSize', defaultFontSize, true)
                    return workspace.getConfiguration().update('editor.fontSize', defaultFontSize, true);
                } catch (exception) {
                    return false;
                }
            } else {
                window.showErrorMessage(`Cannot set default font size to "${defaultFontSize}". Please set it to an integer between ${minFontSize} and ${maxFontSize} in your user settings.`);
            }
        } else {
            // No override is set, remove the fontSize setting to let VSCode set the default font size
            try {
                await workspace.getConfiguration().update('terminal.integrated.fontSize', undefined, true);
                return workspace.getConfiguration().update('editor.fontSize', undefined, true)
                    // Swallow exceptions if fontSize has already been reset
                    .then(() => { }, () => { });
            } catch (exception) {
                return false;
            }
        }
    });

    context.subscriptions.push(increaseSizeCommand, decreaseSizeCommand, resetSizeCommand);
}

export function deactivate() { }
