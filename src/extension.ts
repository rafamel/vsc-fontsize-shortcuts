'use strict';

import { ExtensionContext, commands, window, workspace } from 'vscode';

// Values from common editor config:
// https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/config/commonEditorConfig.ts#L521
const minFontSize = 1;
const maxFontSize = 100;

export function activate(context: ExtensionContext) {

    const increaseDecrease = (increase: boolean) => {
        const changeFontSize = (external: string) => {
            const fontSize = config.get<number>(external),
                newSize = Math.round(
                        ((increase) ? 
                            Math.min(maxFontSize, fontSize + step) : 
                            Math.max(minFontSize, fontSize - step)
                    ) * 10) / 10;
            if (newSize !== fontSize) {
                config.update(external, newSize, true);
            }
        }
        const config = workspace.getConfiguration(),
            step = config.get<number>('fontshortcuts.step'),
            resizeTerminal = config.get<boolean>('fontshortcuts.resizeTerminal');
        changeFontSize('editor.fontSize');
        if (resizeTerminal) changeFontSize('terminal.integrated.fontSize');
    }

    const reset = (internal: string, external: string) => {
        // Check whether an override for the default font size exists
        let defaultFontSize = workspace.getConfiguration("fontshortcuts").get(internal) as number;
        defaultFontSize = Math.round(defaultFontSize * 10) / 10;
        if (defaultFontSize) {
            // Check whether the setting is a valid value
            if (defaultFontSize >= minFontSize && defaultFontSize <= maxFontSize) {
                workspace.getConfiguration().update(external, defaultFontSize, true)
                return;
            }
            window.showErrorMessage(`Cannot set default font size to "${defaultFontSize}". Please set it to an integer between ${minFontSize} and ${maxFontSize} in your user settings.`);
            return;
        }
        workspace.getConfiguration().update(external, undefined, true);
    }

    const increaseSizeCommand = commands.registerCommand('fontshortcuts.increaseFontSize', () => {
        increaseDecrease(true);
    });
    const decreaseSizeCommand = commands.registerCommand('fontshortcuts.decreaseFontSize', () => {
        increaseDecrease(false);
    });

    const resetSizeCommand = commands.registerCommand('fontshortcuts.resetFontSize', () => {
        const resizeTerminal = workspace.getConfiguration("fontshortcuts").get('resizeTerminal') as boolean;

        reset('defaultFontSize', 'editor.fontSize');
        if (resizeTerminal) reset('defaultTerminalFontSize', 'terminal.integrated.fontSize');
    });

    context.subscriptions.push(increaseSizeCommand, decreaseSizeCommand, resetSizeCommand);
}

export function deactivate() { }
