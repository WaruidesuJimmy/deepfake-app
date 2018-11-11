const electron = require('electron')
const cmd = require('node-cmd')
const {
  spawn
} = require('child_process')
const ffmpeg = require('ffmpeg')
const ffmpeg_fluent = require('fluent-ffmpeg');
const command = ffmpeg_fluent();
const getVideoDurationInSeconds = require('get-video-duration')
const fs = require('fs')
const path = require('path')
const fileExtension = require('file-extension')


const dir_to_raw_videos = __dirname + '/v1/data/raw-videos/',
  dir_to_raw_photos = __dirname + '/v1/data/raw-photo/'



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

ipcMain.on('extract-load', (e) => {
  const dirNames = loadDirectoriesNames(dir_to_raw_videos)
  win.webContents.send('extract-load', dirNames)
})


const loadDirectoriesNames = dir => {
  const directories = fs.readdirSync(dir)
  return directories.filter(directory => directory != '.DS_Store')
}


ipcMain.on('extarct', (e, data) => {

  const pyProg = spawn('python', ['faceswap/faceswap.py', 'extract', '-i', 'faceswap/photo/sobolev', '-o', 'extract', '-f', 'faceswap/photo/sobolev/sobolev-0.png']);

  pyProg.stdout.on('data', function (data) {});
})

ipcMain.on('load-raw-data', (e, data) => {
  loadRawData(data)
})

const isImage = file => {
  const image_pattern = ['png', 'jpg', 'jpeg']
  let isImg = false
  image_pattern.forEach((ext) => {
    if (fileExtension(file) === ext) isImg = true
  })
  return isImg
}

const isVideo = file => {
  const image_pattern = ['mp4', 'avi']
  let isVid = false
  image_pattern.forEach((ext) => {
    if (fileExtension(file) === ext) isVid = true
  })
  return isVid
}

const loadRawData = async data => {
  const {
    path,
    name
  } = data
  let videos = []
  let images = []
  let files = await readdirAsync(path)
  console.log(files)
  files.forEach((file) => {
    if (isImage(file)) images.push(file)
    if (isVideo(file)) videos.push(file)
  })
  if (images.length !== 0) copyAll(images, path, dir_to_raw_photos + name)
  if (videos.length !== 0) videos.forEach((video) => convertVideoToImages(path + '/' + video, dir_to_raw_photos + name))


}

const addZeroesToMilliseconds = (ms) => {
  _ms = ms
  if (ms<100) _ms = '0' + _ms
  if (ms<10) _ms = '0' + _ms
  return _ms
}

const addZeroToTimestamp = (tick) => (tick < 10) ? '0' + tick : tick

const getTimestamps = (time_offset, fps, frames) => {
  let timestamps = []
  let hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  let timestamp
  for (let i = 0; i < frames; i++) {
    hours = addZeroToTimestamp(Math.floor(time_offset / 3600))
    minutes = addZeroToTimestamp(Math.floor(time_offset / 60) % 60)
    seconds = addZeroToTimestamp(time_offset - 3600 * hours - minutes * 60)
    milliseconds = addZeroesToMilliseconds((1000 / fps * i) % 1000)
    timestamp = (hours !== 0) ? `${hours}:${minutes}:${seconds}.${milliseconds}` : `${minutes}:${seconds}.${milliseconds}`
    timestamps.push(timestamp)
    if (i % fps === 0) time_offset++
  }
  console.log(timestamps)
}

const convertVideoToImages = async (video, dstDir) => {

  const duration = await getVideoDurationInSeconds(video)
  if (duration === 0 || duration === undefined) throw 'Duration of the video cannot be read!!!'
  const FPS = 20
  const frames = duration * FPS
  const BATCH_SIZE = 100
  let time_offset = 0
  let timestamps = []
  for (let i = 0; i < Math.floor(frames / BATCH_SIZE); i++) {
    timestamps = getTimestamps(time_offset, FPS, BATCH_SIZE)
    ffmpeg_fluent(video)
      .screenshots({
        timestamps: timestamps,
        folder: dstDir,
        filename: `0${i}%i0.png`
      })
      .on('end', () => {
        console.log(`${time_offset*FPS} frames converted`)
      })
    timestamps = []
    time_offset += Math.ceil(BATCH_SIZE / FPS)
  }
  console.log('Video to images converted')


}
const readdirAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) reject(err)
      resolve(files)
    })
  })
}

const copyFile = (srcDir, destDir) => {
  let readStream = fs.createReadStream(srcDir);
  console.log('copying...' + srcDir + ' to ' + destDir)

  readStream.once('error', (err) => {
    throw err
  })
  // readStream.once('end', () => {
  //   console.log('done copying');
  // })
  readStream.pipe(fs.createWriteStream(destDir));
}

const copyAll = (files, srcDir, destDir) =>
  fs.access(destDir, err => {
    if (err) fs.mkdirSync(destDir);
    files.forEach((file) =>
      copyFile(path.join(srcDir, file), path.join(destDir, file))
    )
  })