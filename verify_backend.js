const http = require('http');

const testUser = {
    Name: 'Test User',
    username: 'testuser_' + Date.now(),
    email: 'testuser_' + Date.now() + '@example.com',
    password: 'password123',
    confirmPassword: 'password123'
};

const postData = (path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });

        req.on('error', (e) => reject(e));
        req.write(JSON.stringify(data));
        req.end();
    });
};

const getData = (path) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
};

async function runTests() {
    console.log('--- Verification Started ---');

    // 1. Register
    try {
        console.log(`\n1. Registering ${testUser.username}...`);
        const reg = await postData('/register', testUser);
        console.log(`Status: ${reg.status}, Body: ${reg.body}`);
    } catch (e) { console.error('Registration Error:', e); }

    // 2. Login
    try {
        console.log(`\n2. Logging in...`);
        const login = await postData('/login', { email: testUser.email, password: testUser.password });
        console.log(`Status: ${login.status}, Body: ${login.body}`);
    } catch (e) { console.error('Login Error:', e); }

    // 3. Get Details
    try {
        console.log(`\n3. Getting Details...`);
        const details = await getData(`/get-details?email=${testUser.email}`);
        console.log(`Status: ${details.status}, Body: ${details.body}`);
    } catch (e) { console.error('Get Details Error:', e); }

    console.log('\n--- Verification Finished ---');
}

// Wait for server to definitely be up
setTimeout(runTests, 3000);
