const electron = require('electron')
const cmd = require('node-cmd')
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
  loadRawData(data)
})

ipcMain.on('stop', e => {
  connect('/stop', 'GET')
})

const convert = (data) => {
  const {
    MODEL,
    INPUT_DIR,
    FROM_TO,
    OUTPUT_DIR
  } = data
  let arguments = ['python', dir_to_faceswap, 'convert']
  if (MODEL !== FROM_TO) arguments.push('-s')
  const MODEL_DIR = dir_to_models + MODEL
  arguments.push('-i', INPUT_DIR, '-o', OUTPUT_DIR, '-m', MODEL_DIR)

  console.log(...arguments)
  let command = {
    command: arguments
  }

  connect('/run', 'POST', onData = (_data) => {
    console.log(_data.toString())
  }, onEnd = () => {}, onError = (err) => {}, onClose = () => {}, command)

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
  arguments.push('-A', INPUT_A, '-B', INPUT_B, '-m', MODEL_DIR, '-s', '5')
  // console.log('python faceswap.py train', ...arguments)

  let command = {
    command: arguments
  }


  connect('/run', method = 'POST', onData = (_data) => {
      console.log(_data.toString())
    },
    onEnd = () => {
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
    pathToFace,
    detector
  } = data
  let files = []
  let images = []

  // if (pathToFaces) files = await readdirAsync(pathToFaces)

  // files.forEach((file) => {
  //   if(isImage(file)) images.push(file)
  // })


  if (detector === 'hog' || detector === 'cnn') arguments.push('-D', detector)
  // if(images.length>10) images = images.slice(0, 9)
  // if(images.length > 0 ) images.forEach((image, index) => images[index] = pathToFaces + '/' + image)

  let arguments = ['v1/faceswap.py', 'extract']

  arguments.push('-i', dir_to_raw_photos + name, '-o', dir_to_extracted + name)

  if (pathToFace) arguments.push('-f', pathToFace)

  const pyProg = spawn('python', arguments)


  pyProg.stdout.on('data', data => {
      console.log(`///${data.toString()}`)
    })
    .on('end', () => {
      console.log('complete')
      win.webContents.send('on-complete')
    })
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
  let {
    paths,
    name
  } = data
  let objDir = {
    paths: []
  }
  paths = [...new Set(paths)]
  paths.forEach((path) => {
    if (fs.lstatSync(path).isDirectory()){ readDirRecursivly(path, objDir)}
    if (fs.lstatSync(path).isFile()) objDir.paths.push(path)
  })
  paths = [...new Set(objDir.paths)]
  let videos = []
  let images = []
  // folders.forEach((path) => {
  //   let _files = fs.readdirSync(path)
  //   _files = _files.filter((file) => file !== '.DS_Store')
  //   _files.forEach(_file => files.push(path + '/' +  _file))
  // })
  paths.forEach((file) => {
    if (isImage(file)) images.push(file)
    if (isVideo(file)) videos.push(file)
  })
  // if (images.length !== 0) copyAll(images, path, dir_to_raw_photos + name)
  // if (videos.length !== 0) videos.forEach((video) => convertVideoToImages(path + '/' + video, dir_to_raw_photos + name))
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
    if(path === '.DS_Store') return
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