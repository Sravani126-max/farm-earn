import axios from 'axios';

const testBackend = async () => {
    const urls = [
        'http://localhost:5000/api',
        'http://localhost:5000/api/auth/login',
        'http://localhost:5000/api/debug-routes'
    ];

    console.log('--- Testing Backend Connectivity ---');
    for (const url of urls) {
        try {
            console.log(`Checking ${url}...`);
            const res = await axios.get(url);
            console.log(`✅ Success (${res.status}): ${JSON.stringify(res.data).substring(0, 100)}...`);
        } catch (error) {
            if (error.response) {
                console.log(`⚠️ Partial Success (${error.response.status}): ${url} reachable but returned error.`);
            } else {
                console.log(`❌ Failed to reach ${url}: ${error.message}`);
            }
        }
    }
    console.log('--- Finished ---');
};

testBackend();
