const electron = require('electron')
const cmd = require('node-cmd')
const {
  spawn
} = require('child_process')
const ffmpeg = require('ffmpeg')
const ffmpeg_fluent = require('fluent-ffmpeg');
const command = ffmpeg_fluent();
const getVideoDurationInSeconds  = require('get-video-duration')



const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron')

// Храните глобальную ссылку на объект окна, если вы этого не сделаете, окно будет
// автоматически закрываться, когда объект JavaScript собирает мусор.
let win

function createWindow() {
  // Создаёт окно браузера.
  win = new BrowserWindow({
    width: 1280,
    height: 720
  })

  // и загрузит index.html приложение.
  win.loadFile('index.html')

  // Открыть средства разработчика.
  win.webContents.openDevTools()

  cmd.get('python faceswap/faceswap.py extract -h', (err, data, stderr) => {
    win.webContents.send('log', data)
  })

  // Вызывается, когда окно будет закрыто.
  win.on('closed', () => {
    // Разбирает объект окна, обычно вы можете хранить окна     
    // в массиве, если ваше приложение поддерживает несколько окон в это время,
    // тогда вы должны удалить соответствующий элемент.
    win = null
  })
}

// Этот метод будет вызываться, когда Electron закончит 
// инициализацию и готов к созданию окон браузера.
// Некоторые интерфейсы API могут использоваться только после возникновения этого события.
app.on('ready', createWindow)

// Выйти, когда все окна будут закрыты.
app.on('window-all-closed', () => {
  // Оставаться активным до тех пор, пока пользователь не выйдет полностью с помощью Cmd + Q,
  // это обычное дело для приложений и их строки меню на macOS
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // На MacOS обычно пересоздают окно в приложении,
  // после того, как на иконку в доке нажали, и других открытых окон нету.
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('extarct', (e, data) => {

  const pyProg = spawn('python', ['faceswap/faceswap.py', 'extract', '-i', 'faceswap/photo/sobolev', '-o', 'extract', '-f', 'faceswap/photo/sobolev/sobolev-0.png']);

  pyProg.stdout.on('data', function (data) {});
})

ipcMain.on('ffmpeg', (e, data) => {

  // try {
  //   var process = new ffmpeg('video/sobolev.mp4');
  //   process.then(function (video) {
  //     // Callback mode
  //     video.fnExtractFrameToJPG('ffmpeg', {
  //       frame_rate : 1,
  //       number : 500,
  //       file_name : 'my_frame_%t_%s'
  //     }, function (error, files) {
  //       if (!error)
  //         console.log('Frames: ' + files);
  //     });
  //   }, function (err) {
  //     console.log('Error: ' + err);
  //   });
  // } catch (e) {
  //   console.log(e.code);
  //   console.log(e.msg);
  // }
  getVideoDurationInSeconds.getVideoDurationInSeconds('video/sobolev.mp4').then((_duration) => {
    console.log(_duration)
    ffmpeg_fluent('video/sobolev.mp4')
      .on('filenames', function (filenames) {
        console.log('Will generate ' + filenames.length)
      })
      .on('end', function () {
        console.log('Screenshots taken');
      })
      .screenshots({
        count: _duration, 
        folder: 'ffmpeg/'
      })
  }).catch((err)=>console.log(err))
  
})

// В этом файле вы можете включить код другого основного процесса 
// вашего приложения. Можно также поместить их в отдельные файлы и применить к ним require.