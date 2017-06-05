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
            resizeTerminal = config.get<boolean>('fontshortcuts.resizeTerminal'),
            newSize = sumFontSize(fontSize, step);
        if (newSize !== fontSize) {
            config.update('editor.fontSize', newSize, true);
        }
        if (resizeTerminal) {
            const termFontSize = config.get<number>('terminal.integrated.fontSize'),
                newTermSize = sumFontSize(termFontSize, step);
            if (newTermSize !== termFontSize) {
                config.update('terminal.integrated.fontSize', newTermSize, true);
            }
        }
    }

    const reset = (internal: string, external: string) => {
        // Check whether an override for the default font size exists
        let defaultFontSize = workspace.getConfiguration("fontshortcuts").get(internal) as number;
        if (defaultFontSize) {
            // Check whether the setting is a valid value
            if (defaultFontSize >= minFontSize
                && defaultFontSize <= maxFontSize
            ) {
                defaultFontSize = Math.round(defaultFontSize * 10) / 10;
                try {
                    return workspace.getConfiguration().update(external, defaultFontSize, true);
                } catch (err) {
                    window.showErrorMessage(`Couldn't change font size: ${err}`);
                }
            } else {
                window.showErrorMessage(`Cannot set default font size to "${defaultFontSize}". Please set it to an integer between ${minFontSize} and ${maxFontSize} in your user settings.`);
            }
        } else {
            // No override is set, remove the fontSize setting to let VSCode set the default font size
            try {
                return workspace.getConfiguration().update(external, undefined, true)
                    // Swallow exceptions if fontSize has already been reset
                    .then(() => { }, () => { });
            } catch (exception) {
                return false;
            }
        }

    }
    const increaseSizeCommand = commands.registerCommand('fontshortcuts.increaseFontSize', () => {
        increaseDecrease(true);
    });
    const decreaseSizeCommand = commands.registerCommand('fontshortcuts.decreaseFontSize', () => {
        increaseDecrease(false);
    });
    const resetSizeCommand = commands.registerCommand('fontshortcuts.resetFontSize', async () => {
        reset('defaultFontSize', 'editor.fontSize');
        const resizeTerminal = workspace.getConfiguration("fontshortcuts").get('resizeTerminal') as boolean;
        if (resizeTerminal) reset('defaultTerminalFontSize', 'terminal.integrated.fontSize');
    });

    context.subscriptions.push(increaseSizeCommand, decreaseSizeCommand, resetSizeCommand);
}

export function deactivate() { }
