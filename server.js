const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 座席配置の状態を保持（サーバーメモリ）
let seatState = null;

io.on('connection', (socket) => {
  console.log(`接続: ${socket.id}`);

  // 新規接続時に現在の状態を送信
  if (seatState) {
    socket.emit('state:init', seatState);
  }

  // 座席移動イベント
  socket.on('seat:move', (data) => {
    seatState = data;
    socket.broadcast.emit('seat:update', data);
  });

  // 部署変更イベント
  socket.on('dept:change', (data) => {
    seatState = data;
    socket.broadcast.emit('seat:update', data);
  });

  socket.on('disconnect', () => {
    console.log(`切断: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3456;
server.listen(PORT, () => {
  console.log(`座席表サーバー起動: http://localhost:${PORT}`);
});
