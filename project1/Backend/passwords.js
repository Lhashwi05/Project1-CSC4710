const { randomBytes, scrypt } = require('node:crypto');
const { promisify } = require('node:util');

const scryptAsync = promisify(scrypt);

const options = {
    N: 32768,
    r: 8,
    p: 3,
    maxmem: 64 * 1024 * 1024
};

async function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');

    const key = await scryptAsync(password, salt, 64, options);

    return `scrypt$32768$8$3$${salt}$${key.toString('hex')}`;
}

module.exports = { hashPassword };