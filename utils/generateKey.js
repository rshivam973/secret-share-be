const fernet = require('fernet');
const crypto = require('crypto');

// Generate a random 32-byte key and encode it as base64
const key = crypto.randomBytes(32).toString('base64');

console.log("--- YOUR FERNET ENCRYPTION KEY ---");
console.log("Add this to your .env file as MESSAGE_SECRET_KEY:");
console.log(key);
console.log("----------------------------------");

