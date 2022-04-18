import { w3cwebsocket as W3CWebSocket } from 'websocket';
const localServerUrl = process.env.REACT_APP_LOCAL_SERVER_URL;

const Socket = () => {
  const client = new W3CWebSocket(localServerUrl)
  client.open()

}

export default Socket
