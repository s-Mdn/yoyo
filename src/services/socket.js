import { w3cwebsocket as W3CWebSocket } from 'websocket';
const localServerUrl = process.env.REACT_APP_LOCAL_SERVER_URL;

const Socket = () => {
  const { client } = window
  if( client ) { return false }

  const socket = new W3CWebSocket(localServerUrl)
  socket.onopen = () => {
    window.client = socket
  }
}

export default Socket
