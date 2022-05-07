const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater')
const { spawn, exec } = require('child_process');
// const log = require('electron-log');
const path = require('path');
const fs = require('fs-extra');
let workerProcess = null;
let mainWindow = null;
let cwd = path.join(__dirname, 'server')


// 环境判断
function isDev(env) {
  const reg = /^(development|test)$/.test(env);
  return reg;
}

// 版本更新
function checkUpdate() {
  //更新前，删除本地的安装包
  const updaterCacheDirName = 'yoyoliveweb-updater'
  const updatePending = path.join(autoUpdater.app.baseCachePath, updaterCacheDirName, 'pending')
  fs.emptyDir(updatePending)

  const message = {
    error: '检查更新出错',
    checking: '正在检测更新...',
    updateAva: '检测到新版本，正在下载...',
    updateNote: '现在就是最新版本，不用更新'
  }

  autoUpdater.setFeedURL('https://yoyolivewebpack-test.oss-cn-shenzhen.aliyuncs.com/yoyo/win32-x64')
  autoUpdater.checkForUpdates()

  if(isDev(process.env.NODE_ENV)) {
    autoUpdater.updateConfigPath = path.join(__dirname, './dist/win-unpacked/resources/app-update.yml')
  }
  


  autoUpdater.on('error', (err)=>{
    mainWindow.webContents.send(message.error)
  })
  autoUpdater.on('checking-for-update', ()=>{
    mainWindow.webContents.send(message.updateAva)
  })
  autoUpdater.on('update-available', (info) => {
    // mainWindow.webContents.send(message.updateAva)
    console.log(info, 'update-available')
  })
  autoUpdater.on('update-not-availabel', (info)=>{
    console.log(info, 'update-not-availabel')
    mainWindow.webContents.send(message.updateAva)
  })
  autoUpdater.on('download-progress', (process)=>{
    console.log(process, 'download-progress')
    // log.warn('触发下载...')
  })
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '应用更新',
      message: '发现新版本，是否更新？',
      buttons: ['是', '否']
    }).then((buttonIndex) => {
      if(buttonIndex.response == 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })
}

if (!isDev(process.env.NODE_ENV)) {
  cwd = path.join(__dirname, '..', 'server');
}

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 875,
    resizable:false,
    // frame: false,
    // titleBarStyle: 'hidden',
    center: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true, // 允許在 Render Process 使用 Remote Module
      contextIsolation: false, // 讓在 preload.js 的定義可以傳遞到 Render Process (React)
      webSecurity: false,
    },
  });

  // 设置窗口最小尺寸
  mainWindow.setMinimumSize(1300, 875)
  // 根据环境执行
  if (isDev(process.env.NODE_ENV)) {
    mainWindow.loadURL(`http://localhost:3000`);
  } else {
    mainWindow.loadURL(`file://${__dirname}/../app.asar.unpacked/index.html`);
  }
  mainWindow.on('close', onCloseWindow);
  return mainWindow;
}

// 窗口关闭 windows
function onWindowAllClosed() {
  mainWindow = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

// 销毁播放进程
function destoryVideoProcess() {
  const endBatPath = 'end.bat';
  exec(endBatPath, { cwd: cwd });
  if (typeof workerProcess !== 'undefined') {
    workerProcess = null;
  }
}

// 关闭窗口回调函数
function onCloseWindow() {
  mainWindow = null
}

// 进程调用
function launchVideoProcess(flag) {
  if (!workerProcess || flag) {
    let childProcessCallback = (err, stdout, stderr) => {
      if (err) {
        // log.error('error:', err);
      }
      // log.warn('stdout:', stdout);
      // log.error('stderr:', stderr);
    };

    const cmdStr = 'server.exe'; // 本地需要启动的后台服务可执行文件的路径
    if (!!process.env.ENABLE_SERVER_CONSOLE) {
      workerProcess = spawn(cmdStr, [] , { cwd: cwd, detached: true });
    } else {
      workerProcess = exec(cmdStr, { cwd: cwd }, childProcessCallback);
    }
    workerProcess.on('close', () => {
      // console.log('close!!!!');
      workerProcess = null;
    })
    workerProcess.on('exit', () => {
      // console.log('出错了')
      workerProcess = null;
    })
    workerProcess.on('data', () => {
      // log.info(`workerProcess.stdout:${data}`);
    })
    workerProcess.stderr.on('data', (error) => {
      // log.error(`workerProcess.stderr:${error}`);
    });
  }
}

// 进程间的通信
function ProcessCommunicate () {
  ipcMain.on('restart-server', (event, arg)=>{
    launchVideoProcess()
  })
}

function onReady() {
  createWindow()
  checkUpdate()
  launchVideoProcess()
  ProcessCommunicate()
}

app.on('ready', onReady);
app.on('window-all-closed', onWindowAllClosed);
app.on('quit', destoryVideoProcess);
