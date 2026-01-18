const net = require('net');

const port = 3333;
const host = 'localhost';
const timeout = 60000; // 60 seconds
const interval = 1000; // 1 second

const start = Date.now();

function checkPort() {
    const socket = new net.Socket();
    socket.setTimeout(2000); // 2 second connection timeout

    socket.on('connect', () => {
        console.log(`✅ Port ${port} is open!`);
        socket.destroy();
        process.exit(0);
    });

    socket.on('timeout', () => {
        socket.destroy();
        retry();
    });

    socket.on('error', (err) => {
        socket.destroy();
        retry();
    });

    socket.connect(port, host);
}

function retry() {
    if (Date.now() - start > timeout) {
        console.error(`❌ Timeout waiting for port ${port}`);
        process.exit(1);
    }
    setTimeout(checkPort, interval);
}

console.log(`Waiting for port ${port}...`);
checkPort();
