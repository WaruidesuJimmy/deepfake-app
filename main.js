const electron = require('electron')
const cmd = require('node-cmd')
const videoshow = require('videoshow')
const {
  spawn
} = require('child_process')
const ffmpeg = require('ffmpeg')
const ffmpeg_fluent = require('fluent-ffmpeg');
const command = ffmpeg_fluent();
const {
  getVideoDurationInSeconds
} = require('get-video-duration')
const fs = require('fs')
const path = require('path')
const fileExtension = require('file-extension')
const http = require('http')
const net = require('net')
const FLASK_ADDR = '0.0.0.0'
const FLASK_PORT = '5000'

let images_converted = 0
let images_toconvert = 0
let videos_converted = 0
let videos_toconvert = 0

let to_convert = 0
let converted = 0



const dir_to_raw_videos = __dirname + '/v1/data/raw-videos/',
  dir_to_raw_photos = __dirname + '/v1/data/raw-photo/',
  dir_to_extracted = __dirname + '/v1/data/extracted/',
  dir_to_models = __dirname + '/v1/models/',
  dir_to_faceswap = __dirname + '/v1/faceswap.py'



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

  const pyProg = spawn('python', ['v1/main.py'])
  // pyProg.stdout.on('data', (data) => console.log(data.toString()))

  // Вызывается, когда окно будет закрыто.
  win.on('closed', () => {
    // Разбирает объект окна, обычно вы можете хранить окна     
    // в массиве, если ваше приложение поддерживает несколько окон в это время,
    // тогда вы должны удалить соответствующий элемент.
    connect('/kill')
    const pyProg = spawn('pkill', ['-f v1/main.py'])
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
  let dirNames = loadDirectoriesNames(dir_to_raw_photos)
  dirNames = dirNames.filter((dir) => fs.lstatSync(dir_to_raw_photos + dir).isDirectory())
  win.webContents.send('extract-load', dirNames)
})

ipcMain.on('extract', (e, data) => {
  extract(data)
})

ipcMain.on('train', (e, data) => {
  train(data)
})

ipcMain.on('video-photo', (e, data) => {
  try{
  const {
    VIDEO, 
    OUTPUT_DIR
  } = data
  videos_toconvert = 1
  images_converted = 0
  videos_converted =0 
  images_toconvert= 0
  convertVideoToImages(VIDEO, OUTPUT_DIR)}
  catch(e){
    win.webContents.send('error')
  }
})

ipcMain.on('train-load', e => {
  const dirNames = loadDirectoriesNames(dir_to_extracted)
  win.webContents.send('train-load', dirNames)
})

ipcMain.on('convert-load', e => {
  const dirNames = loadDirectoriesNames(dir_to_models)
  win.webContents.send('convert-load', dirNames)
})

ipcMain.on('convert', (e, data) => {
  convert(data)
})

ipcMain.on('load-raw-data', (e, data) => {
  console.log(data)
  loadRawData(data)
})

ipcMain.on('stop', e => {
  connect('/stop', 'GET')
})

ipcMain.on('convert-photo-video', (e, data) => {
  images_to_video(data)
})


const succesLoadRawData = () => {
  if (images_converted === images_toconvert && videos_converted === videos_toconvert) win.webContents.send('success')
}


const images_to_video = (data) => {
  let videoOptions = {
    fps: 25,
    loop: 5, // seconds
    transition: true,
    transitionDuration: 1, // seconds
    videoBitrate: 1024,
    videoCodec: 'libx264',
    size: '640x?',
    audioBitrate: '128k',
    audioChannels: 2,
    format: 'mp4',
    pixelFormat: 'yuv420p'
  }
  let files = readdirSync(data.inputDir)
  let images = []
  files.map((image) => data.inputDir + '/' + image)

  files.forEach((file) => {
    if (isImage(file)) images.push(file)
  })

  videoshow(images, videoOptions)
    .save(data.outputDir + '/' + 'video.mp4')
    .on('start', function (command) {
      console.log('ffmpeg process started:', command)
    })
    .on('error', function (err, stdout, stderr) {
      console.error('Error:', err)
      console.error('ffmpeg stderr:', stderr)
    })
    .on('end', function (output) {
      console.error('Video created in:', output)
    })
}

const convert = (data) => {
  const {
    MODEL,
    INPUT_DIR,
    FROM_TO,
    OUTPUT_DIR,
    METHOD,
    DETECTOR
  } = data
  to_convert = 0
  converted = 0
  let arguments = ['python', dir_to_faceswap, 'convert']
  if (MODEL !== FROM_TO) arguments.push('-s')
  const MODEL_DIR = dir_to_models + MODEL
  arguments.push('-o', OUTPUT_DIR, '-m', MODEL_DIR)

  console.log(INPUT_DIR)
  let command
  to_convert = INPUT_DIR.length
  INPUT_DIR.forEach((dir => {
    let args = arguments
    args.push('-i', dir)
    command = {command:args}
    win.webContents.send('progress')
    connect('/run', 'POST', onData = (_data) => {
      console.log(_data.toString())
    }, onEnd = () => {}, onError = (err) => {}, onClose = () => {converted++; convertCheck() ;console.log('converted') }, command)
    args = []
    command = {}
  }))

  // connect('/run', 'POST', onData = (_data) => {
  //   console.log(_data.toString())
  // }, onEnd = () => {}, onError = (err) => {}, onClose = () => {}, command)

}

const convertCheck = () => {
  if (converted === to_convert) win.webContents.send('success')
}

const connect = (path, method = 'GET', onData = (_data) => {}, onEnd = () => {
  console.log('end')
}, onError = (err) => {}, onClose = () => {}, data = {}) => {
  if (method === 'GET') {
    let options = {
      hostname: FLASK_ADDR,
      port: FLASK_PORT,
      path: path,
      method: 'GET',
    }
    const req = http.request(options, (response) => {
      console.log('Status:', response.statusCode)
      console.log('Headers: ', response.headers)
      response.pipe(process.stdout)
      response.on('end', () => onEnd())
      response.on('close', () => onClose())
      response.on('data', _data => onData(_data))
      response.on('error', err => onError(err))
    })
    req.end()
  } else if (method === 'POST') {
    let options = {
      hostname: FLASK_ADDR,
      port: FLASK_PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }
    const DATA = JSON.stringify(data)
    options.headers = {
      'Content-Type': 'application/json',
      'Content-Length': DATA.length
    }
    const req = http.request(options, (response) => {
      // console.log('Status:', response.statusCode)
      // console.log('Headers: ', response.headers)
      response.pipe(process.stdout)
      response.on('end', () => onEnd())
      response.on('close', () => onClose())
      response.on('data', _data => onData(_data))
      response.on('error', err => onError(err))
    })
    req.write(DATA)
    req.end()
  }

}

const train = ({
  person_A,
  person_B,
  trainer,
  BATCH_SIZE
}) => {
  let arguments = ['python', dir_to_faceswap, 'train']
  // arguments.push('-s', 100)
  if (trainer === 'LowMem' || trainer === 'GAN') arguments.push('-t', trainer)
  if (!isNaN(BATCH_SIZE)) arguments.push('-bs', BATCH_SIZE)
  const MODEL_DIR = dir_to_models + `${person_A}-${person_B}`
  const INPUT_A = dir_to_extracted + person_A

  const INPUT_B = dir_to_extracted + person_B
  arguments.push('-A', INPUT_A, '-B', INPUT_B, '-m', MODEL_DIR, '-s', '10')
  // console.log('python faceswap.py train', ...arguments)

  let command = {
    command: arguments
  }


  connect('/run', method = 'POST', onData = (_data) => {
      console.log(_data.toString())
      win.webContents.send('progress', _data)
    },
    onEnd = () => {
      win.webContents.send('succes')
      console.log('end')
    },
    onError = (err) => {},
    onClose = () => {}, command)


  // const pyProg = spawn('python', arguments)

  // pyProg.stdout.on('data', (data) => {
  //   console.log(data)
  // })
  // .on('end', () => {
  //   win.webContents.send('on-complete')
  //   console.log('trained')
  // })
  // .on('close', () => console.log('closed'))
  // .on('error', (err) => console.log(err))


}

const loadDirectoriesNames = dir => {
  const directories = fs.readdirSync(dir)
  return directories.filter(directory => directory != '.DS_Store')
}

const extract = async (data) => {
  const {
    name,
    photo_path,
    detector
  } = data
  let files = []
  let images = []

  // if (pathToFaces) files = await readdirAsync(pathToFaces)

  // files.forEach((file) => {
  //   if(isImage(file)) images.push(file)
  // })

  let arguments = ['v1/faceswap.py', 'extract']

  if (detector === 'hog' || detector === 'cnn') arguments.push('-D', detector)
  // if(images.length>10) images = images.slice(0, 9)
  // if(images.length > 0 ) images.forEach((image, index) => images[index] = pathToFaces + '/' + image)



  arguments.push('-i', dir_to_raw_photos + name, '-o', dir_to_extracted + name)

  if (photo_path) arguments.push('-f', photo_path)

  const pyProg = spawn('python', arguments)


  pyProg.stdout.on('data', data => {
      console.log(`///${data.toString()}`)
      win.webContents.send('progress', data)
    })
    .on('end', () => {
      console.log('complete')
      win.webContents.send('success')
    })
    .on('close', () => console.log(close))
}



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
  try {
    videos_toconvert = 0
  images_converted = 0
  videos_converted =0 
  images_toconvert= 0
    let {
      _paths,
      name
    } = data
    let objDir = {
      paths: []
    }
    _paths.forEach((path) => {
      if (fs.lstatSync(path).isDirectory()) {
        readDirRecursivly(path, objDir)
      }
      if (fs.lstatSync(path).isFile()) {
        objDir.paths.push(path);
        console.log(path)
      }
    })
    _paths = [...new Set(objDir.paths)]
    let videos = []
    let images = []
    // folders.forEach((path) => {
    //   let _files = fs.readdirSync(path)
    //   _files = _files.filter((file) => file !== '.DS_Store')
    //   _files.forEach(_file => files.push(path + '/' +  _file))
    // })
    _paths.forEach((file) => {
      if (isImage(file)) images.push(file)
      if (isVideo(file)) videos.push(file)
    })
    videos_toconvert = videos.length
    images_toconvert = images.length
    if (images.length !== 0) {
      win.webContents.send('progress', 'sorting images...');
      copyAll(images, dir_to_raw_photos + name)
    }
    if (videos.length !== 0) {
      videos.forEach((video) => {
        win.webContents.send('progress', 'sorting videos...');
        convertVideoToImages(video, dir_to_raw_photos + name)
      })
    }
  } catch (e) {
    win.webContents.send('error')
  }
}

const addZeroesToMilliseconds = (ms) => {
  _ms = ms
  if (ms < 100) _ms = '0' + _ms
  if (ms < 10) _ms = '0' + _ms
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
    timestamp = (hours !== '00') ? `${hours}:${minutes}:${seconds}.${milliseconds}` : `${minutes}:${seconds}.${milliseconds}`
    timestamps.push(timestamp)
    if (i % fps === 0) time_offset++
  }
  return timestamps
}

const convertVideoFragmentToImages = (video, timeStamps, dstDir, calls_counter) => {
  return new Promise((resolve, reject) => {
    const ffmpeg_video = ffmpeg_fluent(video)
    ffmpeg_video.on('progress', function (progress) {
        console.log('Progress:' + progress);
      })
      .on('filenames', filenames => {
        console.log(`${calls_counter} call`)
      })
      .on('end', () => {
        // console.log(`${time_offset*FPS} frames converted`)
        console.log(`${calls_counter} call is over`)
        resolve(`${calls_counter} call is over`)
      })
      .screenshots({
        timestamps: timeStamps,
        folder: dstDir,
        filename: `${calls_counter}_%00i.png`
      })
  })
}


const readDirRecursivly = (dir, dirObj) => {
  let dirs = fs.readdirSync(dir)
  dirs.forEach((path) => {
    if (path === '.DS_Store') return
    _path = dir + '/' + path
    if (fs.lstatSync(_path).isDirectory()) readDirRecursivly(_path, dirObj)
    if (fs.lstatSync(_path).isFile()) dirObj.paths.push(_path)
  })
}

const convertVideoToImages = async (video, dstDir) => {
  const duration = await getVideoDurationInSeconds(video)
  const FPS = 20
  const frames = duration * FPS
  const BATCH_SIZE = 40
  let time_offset = 0
  let timeStamps = []
  let array = []
  for (let calls_counter = 0; calls_counter < Math.floor(frames / BATCH_SIZE); calls_counter++) {
    timeStamps = getTimestamps(time_offset, FPS, BATCH_SIZE)
    let _value = await convertVideoFragmentToImages(video, timeStamps, dstDir, calls_counter)
    array.push(_value)
    time_offset += Math.ceil(BATCH_SIZE / FPS)
  }
  videos_converted++
  succesLoadRawData()

}

const convertVideoToImages_old = async (video, dstDir) => {
  const duration = await getVideoDurationInSeconds(video)
  const FPS = 20
  const frames = duration * FPS
  const BATCH_SIZE = 40
  let time_offset = 0
  let timeStamps = []
  let calls_counter = 0
  const ffmpeg_video = ffmpeg_fluent(video)
  ffmpeg_video.on('progress', function (progress) {
      console.log('Progress:' + progress);
    })
    .on('filenames', filenames => {
      // console.log(filenames)
    })
    .on('end', () => {
      console.log(`${time_offset*FPS} frames converted`)
    })
  // for (let i = 0; i < Math.floor(frames / BATCH_SIZE); i++) {
  timeStamps = getTimestamps(time_offset, FPS, BATCH_SIZE)
  ffmpeg_video
    .screenshots({
      timestamps: timeStamps,
      folder: dstDir,
      filename: `${calls_counter}_%00i.png`
    })
  timeStamps = []
  time_offset += Math.ceil(BATCH_SIZE / FPS)
  // }
  // console.log('Video to images converted')
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
  readStream.once('error', (err) => {
    throw err
  })
  // readStream.once('end', () => {
  //   console.log('done copying');
  // })
  console.log('copying...' + srcDir + ' to ' + destDir)
  images_converted++
  succesLoadRawData()
  readStream.pipe(fs.createWriteStream(destDir));
}

const copyAll = (files, destDir) =>
  fs.access(destDir, err => {
    if (err) fs.mkdirSync(destDir);
    files.forEach((file, index) => {
      copyFile(file, path.join(destDir, (index + '.png')))
    })
  })