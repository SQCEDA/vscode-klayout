import json
from dataclasses import dataclass
from pathlib import Path
from time import sleep
from typing import Optional
import io
import sys
import traceback

_path = Path(__file__).parent
off = str(_path / "off.png")
live = str(_path / "live.png")
recv = str(_path / "recv.png")

from PIL import Image
Image.new('RGB', (180, 180), (255, 0, 0)).save(off, 'PNG')
Image.new('RGB', (180, 180), (0, 255, 0)).save(live, 'PNG')
Image.new('RGB', (180, 180), (255, 255, 0)).save(recv, 'PNG')

import pya

globals_dict = {}
locals_dict = {}
lastinfo={'id':0,'output':'','error':''}

def execute(code):
    output_buffer = io.StringIO()
    try:
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        sys.stdout = output_buffer
        sys.stderr = output_buffer
        
        exec(code, globals_dict, locals_dict)
        
        lastinfo['error'] = ''

    except Exception as e:
        lastinfo['error'] = traceback.format_exc()
    
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        lastinfo['output'] = output_buffer.getvalue()
        lastinfo['id']+=1
        globals_dict.update(locals_dict)

class KernelInstance(pya.QTcpServer):
    """
    Implements a TCP server listening on port 12082.
    You can use it to instantly load a GDS or lyrdb (Results Database) file, programmatically, from Python.
    Just send a JSON-formatted command to localhost:12082.
    See README for more details.
    """

    def new_connection(self):
        """
        Handler for a new connection
        """

        try:
            self.action.icon = recv
            self.app.process_events()

            # Get a new connection object
            connection = self.nextPendingConnection()

            # Read in the request
            data = None
            returnTime = None
            while (
                connection.isOpen()
                and connection.state() == pya.QTcpSocket.ConnectedState
            ):
                if connection.bytesAvailable() > 0:
                    send_data = {"version": "0.0.9", "klayout_version": pya.__version__}
                    try:
                        line = bytes(connection.read(connection.bytesAvailable()))
                        print(b'<recv>'+line+b'</recv>')
                        data = json.loads(b'\r\n\r\n'.join(line.split(b'\r\n\r\n')[1:]))

                        returnTime = data.get('returnTime','done')

                        send_data["returnTime"] = returnTime
                        if returnTime=='done':
                            execute(data['code'])
                            if lastinfo['output']:print(lastinfo['output'])
                            if lastinfo['error']:print(lastinfo['error'])
                        send_data.update(lastinfo)
                    except Exception as ex:
                        send_data['error']=traceback.format_exc()
                    body=json.dumps(send_data).encode("utf-8")
                    connection.write( ('HTTP/1.0 200\r\nContent-Type: text/json; charset=utf-8\r\nContent-Length: '+str(len(body))+'\r\nAccess-Control-Allow-Origin: *\r\n\r\n').encode('utf-8')+body)
                    connection.flush()
                else:
                    connection.waitForReadyRead(100)

            # Disconnect
            connection.disconnectFromHost()
            signal = pya.qt_signal("disconnected()")
            slot = pya.qt_slot("deleteLater()")
            pya.QObject.connect(connection, signal, connection, slot)

            if returnTime=='now':
                execute(data['code'])
                if lastinfo['output']:print(lastinfo['output'])
                if lastinfo['error']:print(lastinfo['error'])

            self.action.icon = live
            print("disconnected")

        except Exception as ex:
            print("ERROR " + str(ex))

    def __init__(self, server, parent=None, action=None):
        """
        Initialize the server and put into listen mode (port is tcp/12082)
        """

        super(KernelInstance, self).__init__(parent)
        # ha = pya.QHostAddress.new_special(pya.QHostAddress.LocalHost)
        ha = pya.QHostAddress("0.0.0.0")
        self.listen(ha, 12082)
        # ha6 = pya.QHostAddress("::1")
        # self.listen(ha6, 12082)
        self.newConnection(self.new_connection)
        self.action = action
        self.server = server
        if self.action is not None and self.isListening():
            self.action.on_triggered = self.on_action_click
            print("KernelServer 0.0.9 is running")
            self.action.icon = live
        else:
            print("KernelServer didn't start correctly. Most likely port tcp/12082")
        self.app = pya.Application.instance()

    def on_action_click(self):
        self.server.reset(self.action)

    def close(self):
        super().close()

        print("KernelServer 0.0.9 stopped")
        if self.action is not None and not self.action._destroyed():
            self.action.icon = off

    def __del__(self):
        self.close()
        super(KernelInstance, self).__del__()


@dataclass
class KernelServer:
    instance: Optional[KernelInstance] = None
    renew=True

    def reset(self, action):
        app = pya.Application.instance()
        mw = app.main_window()
        if self.instance is not None and self.instance.isListening():
            self.instance.close()
            app.process_events()
        if self.renew:
            sleep(0.1)
            self.instance = KernelInstance(self, parent=mw, action=action)
        self.renew=not self.renew


server = KernelServer()


app = pya.Application.instance()
mw = app.main_window()
menu =  mw.menu()


reset_server = pya.Action()
reset_server.icon_text = "Kernel"
reset_server.icon = off
menu.insert_item("@toolbar.end", "Kernel", reset_server)

# Start the server
server.reset(reset_server)