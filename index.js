const electron = require('electron')
const {ipcRenderer} = electron
const $ = require("jquery");

//const log_div = document.getElementById('console-output').getElementsByTagName('p')[0]

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

ipcRenderer.on('error', (e, data)=>{
   $('#err').show()
   $('#video-photo-loading').hide()
})

/**
* js for menu
**/

function hideAll() {
   $('#video-photo').hide()
   $('#extract').hide()
   $('#train').hide()
   $('#convert').hide()
   $('#photo-video').hide()
}



$('#display-video-photo').on('click', () => {
   hideAll()
   $('#video-photo').show()
})

$('#send-button-video-photo').on('click', ()=>{
   let dir = $('#path-video-photo').val();
   console.log(dir);
   $('#video-photo-loading').show();
   ipcRenderer.send('load-raw-data', dir)
})

$('#video-photo-loading').hide()
$('#video-photo-success').hide()
$('#err').hide()


<<<<<<< HEAD
      let formData = new FormData( document.getElementById ( e.target.id ) );
      ipcRenderer.send('load-raw-data', {path: '/Users/waruidesujimmy/Documents/deepfake-app/v1/data/raw-videos/ikakprosto'})
=======
>>>>>>> 42b4084c788ac643528f6fe6cda6957baa21ac9f

ipcRenderer.on('load-raw-data', (e, data)=>{
   $('#video-photo-success').show()
   $('#video-photo-loading').hide()
})




$('#display-extract').on('click', () => {
   hideAll()
   $('#extract').show()
})

$('#display-train').on('click', () => {
   hideAll()
   $('#train').show()
})

$('#display-convert').on('click', () => {
   hideAll()
   $('#convert').show()
})

$('#display-photo-video').on('click', () => {
   hideAll()
   $('#photo-video').show()
})
