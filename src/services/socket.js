import { w3cwebsocket as W3CWebSocket } from 'websocket';
const localServerUrl = process.env.REACT_APP_LOCAL_SERVER_URL;

const Socket = () => {
  return new W3CWebSocket(localServerUrl)
}

export default Socket()
