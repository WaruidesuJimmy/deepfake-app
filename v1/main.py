from flask import Flask, request, Response
from flask_socketio import send, emit
import subprocess
import sys
import os
import signal
import numpy as np
import cv2
from os.path import isfile, join
from shelljob import proc
app = Flask(__name__)



def convert_frames_to_video(pathIn,pathOut,fps):
    frame_array = []
    files = [f for f in os.listdir(pathIn) if isfile(join(pathIn, f))]
 
    #for sorting the file names properly
    files.sort(key = lambda x: int(x[5:-4]))
 
    for i in range(len(files)):
        filename= pathIn + files[i]
        #reading each files
        img = cv2.imread(filename)
        height, width, layers = img.shape
        size = (width,height)
        print(filename)
        #inserting the frames into an image array
        frame_array.append(img)
 
    out = cv2.VideoWriter(pathOut,cv2.VideoWriter_fourcc(*'DIVX'), fps, size)
 
    for i in range(len(frame_array)):
        # writing to a image array
        out.write(frame_array[i])
    out.release()



@app.route('/video', methods = ['GET', 'POST'])
def video():
    if request.method == 'POST':
        data = request.get_json()
        inputDir = str(data['inputDir'])
        outputDir = str(data['outputDir']) + '/video.mp4'
        fps = 25
        images = [img for img in os.listdir(inputDir) if img.endswith(".png")]
        images = sorted(images)
        frame = cv2.imread(os.path.join(inputDir, images[0]))
        height, width, layers = frame.shape

        video = cv2.VideoWriter(outputDir, -1, fps, (width,height))

        for image in images:
            video.write(cv2.imread(os.path.join(inputDir, image)))

        cv2.destroyAllWindows()
        video.release()

        # convert_frames_to_video(inputDir, outputDir, fps)
        return inputDir


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

@app.route('/kill')
def kill():
    os.popen('pkill -f faceswap.py')
    return 'Process has been killed'
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port='5000', debug = True)
