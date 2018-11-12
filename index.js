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

ipcRenderer.on('success', (e, data)=>{
   hideAll()
   $('#video-photo-loading').hide()
   $('#video-photo-success').show()
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
   let train0 = document.getElementById('train-content0')
   let train1 = document.getElementById('train-content1')
   train0.innerHTML = ''
   train1.innerHTML = ''

   for (let text of data[0]) {
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
      train0.appendChild(wrapp)
   }

   for (let text of data[1]) {
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
      train1.appendChild(wrapp)
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

$('#train-send').on('click', () => {

   $('#video-photo-loading').show()
   let train0 = document.getElementById('train-content0')
      ,train1 = document.getElementById('train-content1')

   let elems0 = train0.getElementsByTagName('input')
      ,elems1 = train1.getElementsByTagName('input')
   let check0 = ''
      ,check1 = ''

   for(let elem of elems0)
      if(elem.checked)
         check0 = elem.id

   for(let elem of elems1)
      if(elem.checked)
         check1 = elem.id

   let answ = {check0, check1}


   ipcRenderer.send('extract', answ)

})
