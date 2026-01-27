const https = require('https');
const http = require('http');

const url = process.env.DEPLOYED_BACKEND_URL || 'http://localhost:5000'; // Default to localhost if not deployed


console.log(`Keep-alive script running. Pinging ${url}/health every 30 seconds.`);

const ping = () => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(`${url}/health`, (res) => {
        console.log(`[${new Date().toISOString()}] Health Check: ${res.statusCode}`);
    }).on('error', (err) => {
        console.error(`[${new Date().toISOString()}] Health Check Error: ${err.message}`);
    });
};

// Ping immediately
ping();

// Then every 30 seconds
setInterval(ping, 30000);
