'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const post = require('./post').post;

/** @param {vscode.ExtensionContext} context */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.convertClassNameRule', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let selection = editor.selection;
        if (selection.isEmpty) {
            return;
        }
        let text = editor.document.getText(selection);
        let groups = text.match(/^(\s*)(?:\\)?((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[([^]*)\](\s*)$/);
        //                        1           2                                    3       4
        let tag = (groups[3] || '').split('\n').length == 1 ? 'span' : 'div';
        if (groups == null) {
            return;
        }
        let classname = groups[2].split('.').slice(1).join(' ');
        let content = groups[1] + '<' + tag + ' class="' + classname + '">' + groups[3] + '</' + tag + '>' + groups[4];
        editor.edit(edit => {
            edit.replace(selection, content);
        });
    });
    let disposable2 = vscode.commands.registerCommand('extension.replacePictureByBase64', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let selection = editor.selection;
        if (selection.isEmpty) {
            return;
        }
        let projectPath = vscode.workspace.rootPath;
        let imagePath = projectPath + '/' + editor.document.getText(selection);
        if (!fs.existsSync(imagePath)) {
            return;
        }
        let data = fs.readFileSync(imagePath);
        let content = '\r\n    data:image/' + imagePath.split('.').slice(-1) + ';base64,' + new Buffer(data).toString('base64') + '\r\n';
        editor.edit(edit => {
            edit.replace(selection, content);
            fs.unlinkSync(imagePath);
        });
    });
    let disposable3 = vscode.commands.registerCommand('extension.insertFormattedTime', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let selection = editor.selection;
        let formatstr = vscode.workspace.getConfiguration('tick')['format'] || 'yyyyMMdd_HHmmss';
        let formatedstr = (function (fmt, dateobj) {
            let o = {
                "M+": dateobj.getMonth() + 1,
                "d+": dateobj.getDate(),
                "H+": dateobj.getHours(),
                "m+": dateobj.getMinutes(),
                "s+": dateobj.getSeconds(),
                "q+": Math.floor((dateobj.getMonth() + 3) / 3),
                "S": dateobj.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (dateobj.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (let k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        })(formatstr, new Date());
        let content = formatedstr;
        editor.edit(edit => {
            edit.replace(selection, content);
        });
    });
    let disposable4 = vscode.commands.registerCommand('extension.insertFormattedTimeWeek', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let selection = editor.selection;
        let content = '';
        let d = new Date();
        d.getDay();
        let w = (d.getDay() + 6) % 7;
        let d1 = new Date((d - 0) - w * 86400000);
        let d2 = new Date((d - 0) + (6 - w) * 86400000);
        let formatefunc = function (fmt, dateobj) {
            let o = {
                "M+": dateobj.getMonth() + 1,
                "d+": dateobj.getDate(),
                "H+": dateobj.getHours(),
                "m+": dateobj.getMinutes(),
                "s+": dateobj.getSeconds(),
                "q+": Math.floor((dateobj.getMonth() + 3) / 3),
                "S": dateobj.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (dateobj.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (let k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        };
        let fmtstr = 'yyyyMMdd';
        let s1 = formatefunc(fmtstr, d1);
        let s2 = formatefunc(fmtstr, d2);
        content = s1 + '-' + s2;
        editor.edit(edit => {
            edit.replace(selection, content);
        });
    });
    // context.subscriptions.push(disposable);
    // context.subscriptions.push(disposable2);
    // context.subscriptions.push(disposable3);
    // context.subscriptions.push(disposable4);
    const submitCode = (code)=>{
        post(
            vscode.workspace.getConfiguration('vscode-klayout').targetUrl,
            {
                code: code
            },
            (data, err) => {
                if (err) {
                    console.error('HTTP请求失败:', err.message);
                    return;
                }
                console.log('HTTP请求成功!');
                console.log('响应:', data);
                if(data.output)console.log(data.output);
                if(data.error)console.error(data.error);
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