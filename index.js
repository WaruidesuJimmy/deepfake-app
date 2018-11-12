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
   let path = $('#path-video-photo').val();
   let name = $('#name-video-photo').val();
   let data = {path, name};
   console.log(data);
   $('#video-photo-loading').show();
   ipcRenderer.send('load-raw-data', data)
})

$('#video-photo-loading').hide()
$('#video-photo-success').hide()
$('#err').hide()


ipcRenderer.on('load-raw-data', (e, data)=>{
   $('#video-photo-success').show()
   $('#video-photo-loading').hide()
})




$('#display-extract').on('click', () => {
<<<<<<< HEAD
   ipcRenderer.send('extract')
=======
   ipcRenderer.send('extract-load')

>>>>>>> 74b1160ffa9c4f9571e827c64c7bf8d423bb9d61
   hideAll()
   $('#extract').show()
   $('#video-photo-loading').show()

})

ipcRenderer.on('extract-load', (e, data)=> {

   $('#video-photo-loading').hide()
   let extract = document.getElementById('extract')

   for (let text of data) {
      let wrapp = document.createElement('div')
      let checkbox = document.createElement('div');
      checkbox.className = 'ui checkbox'
      let input = document.createElement('input');
      input.type = 'checkbox'
      input.name = text
      input.id = text
      let label = document.createElement('label');
      label.htmlFor = text
      label.innerText = text

      checkbox.appendChild(input)
      checkbox.appendChild(label)
      wrapp.appendChild(checkbox)
      extract.appendChild(wrapp)
   }
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
