const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

const users = new Map();
const chatHistory = [];

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'login') {
            users.set(ws, parsedMessage.username);
            ws.send(JSON.stringify({ type: 'history', chatHistory }));
        } else if (parsedMessage.type === 'message') {
            chatHistory.push(parsedMessage);
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        }
    });

    ws.on('close', () => {
        users.delete(ws);
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});