# vscode-klayout

在vscode中往klayout的python ide提交运行脚本

启发自 https://github.com/gdsfactory/klive

在klayout中运行一个server, 在vscode中通过网络通信提交脚本

## 使用

前置: 在klayout python ide中运行 [kernel.py](./kernel.py) 启动server. 设置自动启动见`## 自动启动`

鼠标右键后点`submit selected content`或`submit current file`

可以为它们绑定快捷键, 在`键盘快捷方式(Ctrk+K Ctrl+S)`中搜索`submit`可以找到这两个命令并添加

结果以及报错会打印在终端中(可能需要在设置中填写一个python路径)

## 设置

搜索`klayout`可以找到相关设置. 

`pythonPath`中填写一个python的路径用来打印结果. 默认是`python`, 正常情况下足以使用, 可以填写类似`c:\\path\\to\\python.exe`的完整路径. linux下填`python3`.

`targetUrl`可以指定klayout的服务地址. 默认是`http://127.0.0.1:12082/exec`

## 自动启动server

打开目录`%userprofile%\KLayout\salt`, 解压 [kernel.zip](./kernel.zip)

此时该目录结构类似如下

```
    |-- salt/
        |-- kernel/
            |-- grain.xml
            |-- pymacros/
                |-- kernel.lym
            |-- python/
                |-- kernel.py
```
