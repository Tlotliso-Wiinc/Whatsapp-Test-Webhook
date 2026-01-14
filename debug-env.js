require('dotenv').config();

const token = process.env.ACCESS_TOKEN;
const apiVersion = process.env.API_VERSION;

console.log('--- Environment Variable Debug Phase 2 ---');
if (token) {
    console.log('ACCESS_TOKEN length:', token.length);
    // Check for non-printable characters
    for (let i = 0; i < token.length; i++) {
        if (token.charCodeAt(i) < 33 || token.charCodeAt(i) > 126) {
            console.log(`Found odd character at index ${i}: code ${token.charCodeAt(i)}`);
        }
    }
}
console.log('API_VERSION:', apiVersion);
if (!apiVersion) {
    console.log('WARNING: API_VERSION is undefined!');
}
console.log('------------------------------------------');
