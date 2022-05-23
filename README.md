# YOYOLiveWeb

Data: 2022-2-12

# 简介

[yoyo-live-web]是一个基于`React` 和 `Electron` 的客户端系统。`React`框架开发成web端，`tailwindcss` 作为css库， `Electron`打包成客户端， `electron-updater` 实现更新迭代(https://www.electron.build/)

# 目录结构

```bash
├─ public                     # 静态资源
│   ├─ favicon.ico            # favicon图标
│   └─ index.html             # html模板
├─ src                        # 项目源代码
│   ├─ services               # 接口封装函数、所有请求接口
│   ├─ assets                 # 图片 字体等静态资源
│   ├─ components             # 全局公用组件
│   ├─ config                 # 全局配置
│   │   ├─ menuConfig.js      # 导航菜单配置
│   │   └─ routeMap.js        # 路由配置
│   ├─ store                  # 全局 store管理
│   ├─ utils                  # 全局公用方法
│   ├─ layout                 # layout 页面结构
│   ├─ pages                  # pages 所有页面
│   ├─ App.jsx                # 入口页面
│   └─index.js                # 源码入口
├── .env.development          # 开发环境变量配置
├── .env.prod                 # 生产环境变量配置
├── .env.test                 # 测试环境变量配置
├── main.js                   # electron主进程文件
├── preload.js                # 主进程和渲染进程通信桥梁
├── craco.config.js           # 对cra的webpack自定义配置
└── package.json              # package.json
```

# 安装
```shell
# 安装依赖
npm install

# 切换淘宝源，解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动开发服务
npm run start

# 启动开发环境下的Electron服务
npm run electron:start

# 打包成客户端
  - 执行npm run build-prod，打包成功会出现一个 `build` 文件夹
  - 当目录中有 `build`文件说明web端已经打包成功，在执行npm run build-electron，打包成功成出现一个`dist`文件夹，将`latest.yml、***.exe、***exe.blockmap`上传到服务器，完成更新

接下来你可以修改代码进行业务开发了。
```