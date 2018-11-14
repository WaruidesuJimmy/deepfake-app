const electron = require('electron')
const {
   ipcRenderer
} = electron
const $ = require("jquery");
let paths = new Set()
let photo_path = ''
let photo_path_convert = ''
let paths_convert = new Set()
let photo_to_video = ''
let video_path = ''
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
   $('#tutorial').hide()
   $('#video-photo-v2').hide()
   $('#display-tutorial').removeClass('active')
   $('#display-video-photo-v2').removeClass('active')
   $('#display-video-photo').removeClass('active')
   $('#display-extract').removeClass('active')
   $('#display-train').removeClass('active')
   $('#display-convert').removeClass('active')
   $('#display-photo-video').removeClass('active')
}

$('#tutorial').show()
   $('#display-tutorial').addClass('active')

$('#display-video-photo').on('click', () => {
   hideAll()
   $('#display-video-photo').addClass('active')
   $('#video-photo').show()
   // for (let path of paths) {
   //    $('#dirs').append(`<a class="ui label">
   //    ${path}
   //    <i class="delete icon"><div vlaue = ${path}></div></i>
   //  </a>`)
   // }

})



$('#send-button-video-photo').on('click', () => {
   let name = $('#name-video-photo').val();
   if (name === "") {
      $('.field').addClass('error')
      $('.ui.below.pointing.red.basic.label').css({
         display: 'block'
      })
   }
   let PATHS =  new Array(...paths)
   console.log({PATHS, name});
   $('#video-photo-loading').show();
   ipcRenderer.send('load-raw-data', {_paths: PATHS, name})
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
   let A = document.getElementById('personA')
   let B = document.getElementById('personB')
   A.innerHTML = ''
   B.innerHTML = ''

   for (let text of data) {

      $('#personA').append(
         `
         <option value="${text}">${text}</option>
         `
      )
      $('#personB').append(
         `
         <option value="${text}">${text}</option>
         `
      )
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
      // train0.appendChild(wrapp)
   }

   // for (let text of data[1]) {
   //    let wrapp = document.createElement('div')
   //    wrapp.className = 'field'
   //    let checkbox = document.createElement('div');
   //    checkbox.className = 'ui radio checkbox'
   //    let input = document.createElement('input');
   //    input.type = 'radio'
   //    input.name = 'extract'
   //    input.id = text
   //    let label = document.createElement('label');
   //    label.htmlFor = text
   //    label.innerText = text

   //    checkbox.appendChild(input)
   //    checkbox.appendChild(label)
   //    wrapp.appendChild(checkbox)
   //    train1.appendChild(wrapp)
   // }

})

ipcRenderer.on('convert-load', (e, data) => {

   $('#video-photo-loading').hide()
   let models = document.getElementById('models')
   models.innerHTML = ''
   let fromto = document.getElementById('FROMTO').innerHTML = ''

   for (let text of data) {
      let A = text.substring(0, text.indexOf('-'))
      let B = text.substring(text.indexOf('-')+1)
      let swap = B + '-' + A
      $('#models').append(
         `
         <option value="${text}">${text}</option>
         `
      )
      $('#FROMTO').append(
         `
         <option value="${text}">${text}</option>
         `
      )
      $('#FROMTO').append(
         `
         <option value="${swap}">${swap}</option>
         `
      )
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
      // convert.appendChild(wrapp)
   }

})

$('#display-video-photo-v2').on('click', () => {
   hideAll()
   $('#display-video-photo-v2').addClass('active')
   $('#video-photo-v2').show()
})


$('#display-tutorial').on('click', () => {
   hideAll()
   $('#display-tutorial').addClass('active')
   $('#tutorial').show()
})

$('#display-photo-video').on('click', () => {
   hideAll()
   $('#display-photo-video').addClass('active')
   $('#photo-video').show()
})

$('#display-extract').on('click', () => {
   ipcRenderer.send('extract-load')

   hideAll()
   $('#display-extract').addClass('active')
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
    console.log(photo_path)
   //  let photo_path = photo_path

   ipcRenderer.send('extract', {name, photo_path, detector})


})

$('#send-button-video-photo-v2').on('click', () => {
   $('#video-photo-loading').show()
   // let extract = document.getElementById('extract-content')
   // let elems = extract.getElementsByTagName('input')
   // let check = '';

   // for (let elem of elems)
   //    if (elem.checked)
   //       check = elem.id
    
   let VIDEO = video_path
   let OUTPUT_DIR = $('#dir-video-photo').val()

   ipcRenderer.send('video-photo', {VIDEO, OUTPUT_DIR})


})

$('#display-train').on('click', () => {
   ipcRenderer.send('train-load')

   hideAll()
   $('#display-train').addClass('active')
   $('#train').show()
   $('#video-photo-loading').show()
})

$('#train-send').on('click', () => {

   $('#video-photo-loading').show()
   // let train0 = document.getElementById('train-content0'),
   //    train1 = document.getElementById('train-content1')

   // let elems0 = train0.getElementsByTagName('input'),
   //    elems1 = train1.getElementsByTagName('input')
   // let check0 = '',
   //    check1 = ''

   // for (let elem of elems0)
   //    if (elem.checked)
   //       check0 = elem.id

   // for (let elem of elems1)
   //    if (elem.checked)
   //       check1 = elem.id

   // let answ = {
   //    check0,
   //    check1
   // }

   let person_A = $('#personA').val()
   let person_B = $('#personB').val()
   let trainer = $('#train-methods').val()
   let BATCH_SIZE = $('#bs').val()
   ipcRenderer.send('train', {person_A, person_B, trainer, BATCH_SIZE})

})

$('#send-button-phot-video').on('click', (e => {
   let dir = $('#directory-photo-video').val()
   let inputDir = photo_to_video
   ipcRenderer.send('convert-photo-video',{outputDir: dir, inputDir: inputDir})
}))

$('#display-convert').on('click', () => {
   ipcRenderer.send('convert-load')

   hideAll()
   $('#display-convert').addClass('active')
   $('#convert').show()
   $('#video-photo-loading').show()

})

$('#convert-send').on('click', () => {
   $('#video-photo-loading').show()
   // let convert = document.getElementById('convert-content')
   // let elems = convert.getElementsByTagName('input')
   // let check = '';

   // for (let elem of elems)
   //    if (elem.checked)
   //       check = elem.id
   let METHOD = $('#convert-methods').val()
   let MODEL = $('#models').val()
   let FROM_TO = $('#FROMTO').val()
   let INPUT_DIR = new Array(...paths_convert)
   let OUTPUT_DIR = $('#convert-output-directory').val()
   let DETECTOR = $('#convert-detector').val()
   let PHOTO = photo_path_convert
   ipcRenderer.send('convert', {METHOD, MODEL, FROM_TO, INPUT_DIR, OUTPUT_DIR, DETECTOR, PHOTO})


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
      console.log(paths)
      $('#dirs').append(`<a class="ui label">${f.path}<i class="delete icon" onclick="delete_icon(this)"><div vlaue = '!${f.path}!'></div></i></a>`)

   }

   return false;
}


let darg_photo_video = document.getElementById('drag-photo-video');

darg_photo_video.ondragover = () => {
   return false;
};

darg_photo_video.ondragleave = () => {
   return false;
};

darg_photo_video.ondragend = () => {
   return false;
};
darg_photo_video.ondrop = (e) => {
   e.preventDefault();
   for (let f of e.dataTransfer.files) {
      console.log(f.path)
      photo_to_video = f.path
      $('#dirs-photo-video').html(`<a class="ui label">${f.path}<i class="delete icon" onclick="delete_photo_video(this)"><div vlaue = '!${f.path}!'></div></i></a>`)

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

function delete_icon_convert(elm) {
   let inner = $(elm).html()
   inner = inner.substring(inner.indexOf('!')+1, inner.lastIndexOf('!'))
   $(elm).parent().remove()
   paths_convert.delete(inner)
}

function delete_photo_video(elm) {
   let inner = $(elm).html()
   inner = inner.substring(inner.indexOf('!')+1, inner.lastIndexOf('!'))
   $(elm).parent().remove()
   photo_to_video.delete(inner)
}


let convert = document.getElementById('drag-convert');

convert.ondragover = () => {
   return false;
};

convert.ondragleave = () => {
   return false;
};

convert.ondragend = () => {
   return false;
};

convert.ondrop = (e) => {
   e.preventDefault();
   for (let f of e.dataTransfer.files) {
      if (paths_convert.has(f.path)) continue
      paths_convert.add(f.path)
      $('#dirs-convert').append(`<a class="ui label">${f.path}<i class="delete icon" onclick="delete_icon_convert(this)"><div vlaue = '!${f.path}!'></div></i></a>`)

   }

   return false;
}


let drop_photo_convert = document.getElementById('drop-photo-convert');

drop_photo_convert.ondragover = () => {
   return false;
};

drop_photo_convert.ondragleave = () => {
   return false;
};

drop_photo_convert.ondragend = () => {
   return false;
};

drop_photo_convert.ondrop = (e) => {
   e.preventDefault();

   for (let f of e.dataTransfer.files) {
      $('#photo-convert').html(
         `
         <img src= ${f.path}>
         `
      )
      photo_path_convert = f.path

   }


   return false;
}



let darg_video = document.getElementById('drag-video');

darg_video.ondragover = () => {
   return false;
};

darg_video.ondragleave = () => {
   return false;
};

darg_video.ondragend = () => {
   return false;
};
darg_video.ondrop = (e) => {
   e.preventDefault();
   for (let f of e.dataTransfer.files) {
      console.log(f.path)
      video_path = f.path
      $('#dirs-video-photo').html(`<a class="ui label">${f.path}<i class="delete icon" onclick="delete_video(this)"><div vlaue = '!${f.path}!'></div></i></a>`)

   }

   return false;
}

function delete_video(elm) {
   video_path = ''
   $(elm).parent().remove()
}