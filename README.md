# YOYOLiveWeb

Data: 2022-2-12
Author: zhangyunbin

基于Create React App搭建基础项目架构
Craco 修改默认配置项目
  - React脚手架的react-scripts和Craco存在版本冲突，当前脚手架生成的react-scripts版本是5.0.0，不指定Craco版本安装的版本是6.4.3，会出现无法安装的情况，可以通过 --force(强制安装)，又或者通过 --legacy-peer-deps可以安装成功(https://blog.csdn.net/weixin_41876046/article/details/120952621)

tailwind 实现响应式 (https://www.tailwindcss.cn/)
  - 如果react-scripts版本是5以上，运行项目可能会出现第三方npm包报错的问题，项目中解决打方案是将react-scripts降级4版本
  - tailwind没有热更新，目前的做法的是在执行脚本前增加TAILWIND_MODE=watch，监视改变

主进程中通过loadURL加载web资源到渲染进程，所以需要先执行start命令，再执行electron:start，又或者可以通过concurrently来控制先后执行，此处我们是先执行start，在执行electron:start来实现

Create React App脚手架已经集成了eslint的配置，项目中也增加部分rules实现统一，具体请看package.json文件

PlayAuto 播放页
  - 函数组件
  - 播放列表，选中的播放，商品，背景图，播放状态，横竖屏的数据信息都用redux存放(要求保留状态)
GoodsManage 商品管理也
Profile个人中心也
  - 函数组件
  - 播放中，不可以修改账号和密码和退出，因为修改了要退出重新登录
  - 清晰度是硬代码

项目结构
public
  - 模版
src
  - assets
    - 静态资源(图片)
  - components
    - 通用组件
  - layout
    - 页面容器
  - pages
    - 页面组件
  - router
    - 路由配置
  - services
    - Axios封装
  - utils
    - 工具函数
  - index.js
    - react 入口
  - TitleBar.js
    - electron标题看
.editorconfig
  - 统一编译器的风格
.env.development
  - 开发环境配置
.env.prod
  -
.env.test
  -
craco.config.js
  - craco 配置文件
main.js
  - 主进程逻辑
preload.js
  - 渲染进程和主进程的通信
