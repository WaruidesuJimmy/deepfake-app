const electron = require('electron')
const {ipcRenderer} = electron
const $ = require("jquery");

const log_div = document.getElementById('console-output').getElementsByTagName('p')[0]

ipcRenderer.on('log', (e, data) => {
    log_div.innerText = data
})

ipcRenderer.on('ffmpeg', (e, data)=>{
    log_div.innerText = data
    // console.log(data)
})

$('#ffmpeg').on('click', ()=>{
    let dir = $('#directory_to_videos').val()
    ipcRenderer.send('ffmpeg', dir)
})
