const electron = require('electron')
const {
   ipcRenderer
} = electron
const $ = require("jquery");
let paths = new Set()
let PATHS = []
let photo_path = ''
//const log_div = document.getElementById('console-output').getElementsByTagName('p')[0]

ipcRenderer.on('log', (e, data) => {
   log_div.innerText = data
})

ipcRenderer.on('ffmpeg', (e, data) => {
   log_div.innerText = data
   // console.log(data)
})

$('#ffmpeg').on('click', () => {
   let dir = $('#directory_to_videos').val()
   ipcRenderer.send('ffmpeg', dir)
})

ipcRenderer.on('error', (e, data) => {
   $('#err').show()
   $('#video-photo-loading').hide()
})

ipcRenderer.on('success', (e, data) => {
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
   // for (let path of paths) {
   //    $('#dirs').append(`<a class="ui label">
   //    ${path}
   //    <i class="delete icon"><div vlaue = ${path}></div></i>
   //  </a>`)
   // }

})



$('#send-button-video-photo').on('click', () => {
   let path = $('#path-video-photo').val();
   let name = $('#name-video-photo').val();
   let data = {
      paths,
      name
   }
   console.log(name)
   if (name === "") {
      $('.field').addClass('error')
      $('.ui.below.pointing.red.basic.label').css({
         display: 'block'
      })
   }
   console.log(data);
   $('#video-photo-loading').show();
   ipcRenderer.send('load-raw-data', data)
})

$('#video-photo-loading').hide()
$('#video-photo-success').hide()
$('#err').hide()


ipcRenderer.on('load-raw-data', (e, data) => {
   $('#video-photo-success').show()
   $('#video-photo-loading').hide()
})

ipcRenderer.on('extract-load', (e, data) => {

   $('#video-photo-loading').hide()
   let extract = document.getElementById('extract-names')
   extract.innerHTML = ''
   for (let text of data) {
      // let wrapp = document.createElement('div')
      // wrapp.className = 'field'
      // let checkbox = document.createElement('div');
      // checkbox.className = 'ui radio checkbox'
      // let input = document.createElement('input');
      // input.type = 'radio'
      // input.name = 'extract'
      // input.id = text
      // let label = document.createElement('label');
      // label.htmlFor = text
      // label.innerText = text

      // checkbox.appendChild(input)
      // checkbox.appendChild(label)
      // wrapp.appendChild(checkbox)
      // extract.appendChild(wrapp)
      $('#extract-names').append(
         `
         <option value="${text}">${text}</option>
         `
      )
   }

})

ipcRenderer.on('train-load', (e, data) => {

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

ipcRenderer.on('convert-load', (e, data) => {

   $('#video-photo-loading').hide()
   let convert = document.getElementById('convert-content')
   convert.innerHTML = ''

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
      convert.appendChild(wrapp)
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
   // let extract = document.getElementById('extract-content')
   // let elems = extract.getElementsByTagName('input')
   // let check = '';

   // for (let elem of elems)
   //    if (elem.checked)
   //       check = elem.id
    let name= $('#extract-names').val()
    let detector = $('#extract-methods').val()

   ipcRenderer.send('extract', {name, photo_path, detector})


})

$('#display-train').on('click', () => {
   ipcRenderer.send('train-load')

   hideAll()
   $('#train').show()
   $('#video-photo-loading').show()
})

$('#train-send').on('click', () => {

   $('#video-photo-loading').show()
   let train0 = document.getElementById('train-content0'),
      train1 = document.getElementById('train-content1')

   let elems0 = train0.getElementsByTagName('input'),
      elems1 = train1.getElementsByTagName('input')
   let check0 = '',
      check1 = ''

   for (let elem of elems0)
      if (elem.checked)
         check0 = elem.id

   for (let elem of elems1)
      if (elem.checked)
         check1 = elem.id

   let answ = {
      check0,
      check1
   }


   ipcRenderer.send('train', answ)

})

$('#display-convert').on('click', () => {
   ipcRenderer.send('convert-load')

   hideAll()
   $('#convert').show()
   $('#video-photo-loading').show()

})

$('#convert-send').on('click', () => {
   $('#video-photo-loading').show()
   let convert = document.getElementById('convert-content')
   let elems = convert.getElementsByTagName('input')
   let check = '';

   for (let elem of elems)
      if (elem.checked)
         check = elem.id

   ipcRenderer.send('convert', check)


})



ipcRenderer.on('progress', (data) => {

})

let holder = document.getElementById('drag');

holder.ondragover = () => {
   return false;
};

holder.ondragleave = () => {
   return false;
};

holder.ondragend = () => {
   return false;
};

holder.ondrop = (e) => {
   e.preventDefault();
   for (let f of e.dataTransfer.files) {
      if (paths.has(f.path)) continue
      paths.add(f.path)
      $('#dirs').append(`<a class="ui label">${f.path}<i class="delete icon" onclick="delete_icon(this)"><div vlaue = '!${f.path}!'></div></i></a>`)

   }

   return false;
}


let drop_photo = document.getElementById('drop-photo');

drop_photo.ondragover = () => {
   return false;
};

drop_photo.ondragleave = () => {
   return false;
};

drop_photo.ondragend = () => {
   return false;
};

drop_photo.ondrop = (e) => {
   e.preventDefault();

   for (let f of e.dataTransfer.files) {
      $('#photo').html(
         `
         <img src= ${f.path}>
         `
      )
      photo_path = f.path

   }


   return false;
}

function delete_icon(elm) {
   let inner = $(elm).html()
   inner = inner.substring(inner.indexOf('!')+1, inner.lastIndexOf('!'))
   $(elm).parent().remove()
   paths.delete(inner)
}
