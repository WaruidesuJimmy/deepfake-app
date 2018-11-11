const electron = require('electron')
const {ipcRenderer} = electron

var $ = require("jquery");

const log_div = document.getElementById('console-output').getElementsByTagName('p')[0]

ipcRenderer.on('log', (e, data) => {
    log_div.innerText = data
})


ipcRenderer.on('ffmpeg', (e, data)=>{
    log_div.innerText = data
    // console.log(data)
})

function dropHandler(ev) {
    console.log('File(s) dropped');
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          console.log('... file[' + i + '].name = ' + file.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
      }
    } 
    
    // Pass event to removeDragData for cleanup
    removeDragData(ev)
  }

  function dragOverHandler(ev) {
    console.log('File(s) in drop zone'); 
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  function removeDragData(ev) {
    console.log('Removing drag data');
  
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to remove the drag data
      ev.dataTransfer.items.clear();
    } else {
      // Use DataTransfer interface to remove the drag data
      ev.dataTransfer.clearData();
    }
  }



$('#ffmpeg').on('click', ()=>{
    let dir = $('#directory_to_videos').val()
    ipcRenderer.send('ffmpeg', dir)
})


  $('.rapid.example .ui.button')
  .on('click', function() {
    var
      $progress       = $('.rapid.example .ui.progress'),
      $button         = $(this),
      updateEvent
    ;
    // restart to zero
    clearInterval(window.fakeProgress)
    $progress.progress('reset');
     // updates every 10ms until complete
    window.fakeProgress = setInterval(function() {
      $progress.progress('increment');
      $button.text( $progress.progress('get value') );
      // stop incrementing when complete
      if($progress.progress('is complete')) {
        clearInterval(window.fakeProgress)
      }
    }, 10);
  })
;
// $('.rapid.example .ui.progress')
//   .progress({
//     duration : 200,
//     total    : 200,
//     text     : {
//       active: '{value} of {total} done'
//     }
//   })
// ;