const WebSocket = require('ws');

let clients = [];
let wss = null;

const createWss = (server) => {
  wss = new WebSocket.Server({ server, clientTracking: true });

  wss.on('connection', (ws) => {
    const id = Math.floor((Math.random() * 999999) + 100000);
    ws.rsid = id;
    ws.sendJson = (data) => {
      ws.send(JSON.stringify(data));
    };
    clients.push({ id, ws });

    ws.on('message', (data) => {
      if (data === 'getLoginToken') ws.sendJson({ action: 'login-token', loginToken: ws.rsid.toString() });
      else ws.send(`Hi ${ws.rsid}. I got your message`);
    });

    ws.on('close', () => {
      // console.log(`=======> WS: Client# ${ws.rsid} disappeared.`);
      clients = clients.filter((d) => d.id !== ws.rsid);
    });

    // console.log(`=======> WS: Client# ${id} appeared.`);
    ws.sendJson({ action: 'welcome', id });
  });
};

const sendToClient = (clientId, data) => {
  try {
    if (typeof data === 'string') data = { message: data };
    if (!clientId) return 'Please send client id';
    const client = clients.find((d) => d.id === parseInt(clientId, 10));
    if (!client) return 'Invalid Client ID.';
    return client.ws.sendJson(data);
  } catch (e) {
    console.log(e.message);
    return null;
  }
};

const getClientsList = () => clients.map((d) => d.id);

module.exports = {
  createWss, wss, getClientsList, sendToClient,
};
