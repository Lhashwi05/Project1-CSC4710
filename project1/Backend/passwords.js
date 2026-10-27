const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
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

async function verifyPassword(password, storedHash) {
    if (typeof password !== 'string' ||
        typeof storedHash !== 'string') {
        return false;
    }

    const parts = storedHash.split('$');

    // Check that the stored value matches our password-hash format.
    if (parts.length !== 6 ||
        parts.slice(0, 4).join('$') !== 'scrypt$32768$8$3') {
        return false;
    }

    const salt = parts[4];
    const savedKey = parts[5];

    if (!/^[a-f0-9]{32}$/.test(salt) ||
        !/^[a-f0-9]{128}$/.test(savedKey)) {
        return false;
    }

    // Reuse the original salt with the password being checked.
    const key = await scryptAsync(password, salt, 64, options);

    return timingSafeEqual(key, Buffer.from(savedKey, 'hex'));
}

module.exports = { hashPassword, verifyPassword };