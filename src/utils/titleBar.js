export function getElectronModule (moduleKey) {
  if (moduleKey in window && typeof window.require === 'function') {
    return window.require('electron')[moduleKey];
  } else if (window[moduleKey]) {
    return window[moduleKey];
  }else {
    return null;
  }
};


// 读取Electro
export const getCurrentWindow = () => {
  if (window.isElectron) {
    const remote = getElectronModule('remote');
    if (remote) {
      return remote.getCurrentWindow();
    } else {
      return null;
    }
  } else {
    return null;
  }
};
