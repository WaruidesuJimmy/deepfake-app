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

hideAll()

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

ipcRenderer.on('extract-load', (e, data)=> {

   $('#video-photo-loading').hide()
   let extract = document.getElementById('extract-content')
   extract.innerHTML = ''

   for (let text of data) {
      let wrapp = document.createElement('div')
      wrapp.className = 'field'
      let checkbox = document.createElement('div');
      checkbox.className = 'ui radio checkbox'
      let input = document.createElement('input');
      input.type = 'radio'
      input.name = 'extract'
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

ipcRenderer.on('train-load', (e, data)=> {

   $('#video-photo-loading').hide()
   let train = document.getElementById('train')
   train.innerHTML = ''

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
      train.appendChild(wrapp)
   }
})

ipcRenderer.on('convert-load', (e, data)=> {

   $('#video-photo-loading').hide()
   let convert = document.getElementById('convert')
   convert.innerHTML = ''

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
      convert.appendChild(wrapp)
   }
})

ipcRenderer.on('photo-video-load', (e, data)=> {

   $('#video-photo-loading').hide()
   let photo = document.getElementById('photo-video')
   photo.innerHTML = ''

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
      photo.appendChild(wrapp)
   }
})




$('#display-extract').on('click', () => {
   ipcRenderer.send('extract-load')

   hideAll()
   $('#extract').show()
   $('#video-photo-loading').show()

})

$('#extract-send').on('click', () => {
   $('#video-photo-loading').show()
   let extract = document.getElementById('extract-content')
   let elems = extract.getElementsByTagName('input')
   let check = '';

   for(let elem of elems)
      if(elem.checked)
         check = elem.id

   ipcRenderer.send('extract', check)


})

$('#display-train').on('click', () => {
   ipcRenderer.send('train-load')

   hideAll()
   $('#train').show()
   $('#video-photo-loading').show()
})

$('#display-convert').on('click', () => {
   ipcRenderer.send('convert-load')

   hideAll()
   $('#convert').show()
   $('#video-photo-loading').show()
})

$('#display-photo-video').on('click', () => {
   ipcRenderer.send('photo-video-load')

   hideAll()
   $('#photo-video').show()
   $('#video-photo-loading').show()
})
