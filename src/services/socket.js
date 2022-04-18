import { w3cwebsocket as W3CWebSocket } from 'websocket';
const localServerUrl = process.env.REACT_APP_LOCAL_SERVER_URL;

const Socket = () => {
  const { clent } = window
  if( clent ) { return false }

  const socket = new W3CWebSocket(localServerUrl)
  socket.open = () => {
    window.clent = socket
  }
}

export default Socket
