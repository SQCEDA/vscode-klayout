'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const post = require('./post').post;

/** @param {vscode.ExtensionContext} context */
function activate(context) {

    let terminal = null;
    const display = (text,state)=>{
        if(!terminal || terminal.exitStatus)terminal = vscode.window.createTerminal({
            name: 'klayout',
            cwd: '.'
        });
        terminal.show();
        let target=state?'stderr':'stdout'
        terminal.sendText(`"${vscode.workspace.getConfiguration('vscode-klayout').pythonPath}" -c "import base64;import sys;sys.${target}.write(base64.b64decode('${Buffer.from(text).toString('base64'
        )}').decode())"`);
    }
    const submitCode = (code)=>{
        post(
            vscode.workspace.getConfiguration('vscode-klayout').targetUrl,
            {
                code: code
            },
            (data, err) => {
                if (err) {
                    display('HTTP请求失败:'+ err.message,1);
                    return;
                }
                display('HTTP请求成功! 响应:'+ JSON.stringify(data),0);
                if(data.output)display(data.output,0);
                if(data.error)display(data.error,1);
            }
        );
    };
    context.subscriptions.push(vscode.commands.registerCommand('extension.submitselectscript', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let selection = editor.selection;
        if (selection.isEmpty) {
            return;
        }
        let text = editor.document.getText(selection);
        submitCode(text);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.submitcurrentfile', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let text = editor.document.getText();
        submitCode(text);
    }));
}
exports.activate = activate;