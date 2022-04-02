const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater')
const path = require('path');
const { spawn, exec } = require('child_process');

const log = console;
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
  autoUpdater.setFeedURL('https://yoyolivewebpack-test.oss-cn-shenzhen.aliyuncs.com/yoyo/win32-x64')

  // 检测更新
  autoUpdater.checkForUpdates()

  //监听'error'事件
  autoUpdater.on('error', (err) => {
    console.log(err)
  })

  //监听'update-available'事件，发现有新版本时触发
  autoUpdater.on('update-available', () => {
    console.log('found new version')
  })

  //监听'update-downloaded'事件，新版本下载完成时触发
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '应用更新',
      message: '发现新版本，是否更新？',
      buttons: ['是', '否']
    }).then((buttonIndex) => {
      if(buttonIndex.response == 0) {  //选择是，则退出程序，安装新版本
        autoUpdater.quitAndInstall()
        app.quit()
      }
    })
  })
}

if (!isDev(process.env.NODE_ENV)) {
  cwd = path.join(__dirname, '..', 'server');
}

log.log(cwd)
// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1175,
    height: 875,
    // frame: false,
    // titleBarStyle: 'hidden', // 隐藏边框
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
  mainWindow.setMinimumSize(1100, 720)
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
        log.error('error:', err);
      }
      log.warn('stdout:', stdout);
      log.error('stderr:', stderr);
    };

    const cmdStr = 'server.exe'; // 本地需要启动的后台服务可执行文件的路径
    if (!!process.env.ENABLE_SERVER_CONSOLE) {
      workerProcess = spawn(cmdStr, [] , { cwd: cwd, detached: true });
    } else {
      workerProcess = exec(cmdStr, { cwd: cwd }, childProcessCallback);
    }
    workerProcess.on('close', () => {
      console.log('close!!!!');
      workerProcess = null;
    })
    workerProcess.on('exit', () => {
      workerProcess = null;
    })
    workerProcess.on('data', () => {
      log.info(`workerProcess.stdout:${data}`);
    })
    workerProcess.stderr.on('data', (error) => {
      log.error(`workerProcess.stderr:${error}`);
    });
  }
}

function onReady() {
  launchVideoProcess()
  createWindow()
  // checkUpdate()
}

app.on('ready', onReady);
app.on('window-all-closed', onWindowAllClosed);
app.on('quit', destoryVideoProcess)
