const https = require('https');
const http = require('http');
const Ping = require('../models/Ping');

const url = process.env.DEPLOYED_BACKEND_URL || 'http://localhost:5000'; // Default to localhost if not deployed

console.log(`Keep-alive script running. Pinging ${url}/health and database every 30 seconds.`);

const ping = async () => {
    // HTTP health check
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(`${url}/health`, (res) => {
        console.log(`[${new Date().toISOString()}] Health Check: ${res.statusCode}`);
    }).on('error', (err) => {
        console.error(`[${new Date().toISOString()}] Health Check Error: ${err.message}`);
    });

    // Database keep-alive operation
    try {
        // Create or update a ping document to keep database active
        const pingDoc = await Ping.findOneAndUpdate(
            { status: 'active' }, // Find active ping document
            {
                message: `Database keep-alive ping at ${new Date().toISOString()}`,
                timestamp: new Date()
            },
            {
                upsert: true, // Create if doesn't exist
                new: true,    // Return updated document
                setDefaultsOnInsert: true
            }
        );

        console.log(`[${new Date().toISOString()}] Database Ping: ${pingDoc._id}`);
    } catch (dbError) {
        console.error(`[${new Date().toISOString()}] Database Ping Error: ${dbError.message}`);
    }
};

// Ping immediately
ping();

// Then every 30 seconds
setInterval(ping, 30000);
