from flask import Flask, request, Response
from flask_socketio import send, emit
import subprocess
import sys
import os
import signal
from shelljob import proc
app = Flask(__name__)




@app.route('/extract')
def extract():
    return 'extract'


@app.route( '/stream' )
def stream():
    g = proc.Group()
    p = g.run( [ "bash", "-c", "for ((i=0;i<5;i=i+1)); do echo $i; sleep 1; done" ] )

    def read_process():
        while g.is_pending():
            lines = g.readlines()
            for proc, line in lines:
                yield line

    return Response( read_process(), mimetype= 'text/plain' )



@app.route('/run', methods = ['GET', 'POST'])
def run():
    if request.method == 'GET':
        return "LOL LOL"
    if request.method == 'POST':
        command = request.get_json()
        g = proc.Group()
        p = g.run( command['command'] )
        def read_process():
            while g.is_pending():
                lines = g.readlines()
                for proc, line in lines:
                    yield line 

        return Response( read_process(), mimetype= 'text/plain' )

@app.route('/convert')
def convert():
    return convert

@app.route('/stop')
def kill():
    os.popen('pkill -f faceswap.py')
    return 'Process has been killed'
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port='5000', debug = True)