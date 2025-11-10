# vscode-klayout

在vscode中往klayout的python ide提交运行脚本

启发自 https://github.com/gdsfactory/klive

在klayout中运行一个server, 在vscode中通过网络通信提交脚本

## 使用

鼠标右键后点`submit selected content`或`submit current file`

可以为它们绑定快捷键, 在`键盘快捷方式(Ctrk+K Ctrl+S)`中搜索`submit`可以找到这两个命令并添加

结果以及报错会打印在`输出(Ctrl+Shift+U) 的 Server`一栏中

## 设置

搜索`targetUrl`可以指定klayout的服务地址. 默认是`http://127.0.0.1:12082/exec`
