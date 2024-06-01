const crypto = require('crypto');
let key = crypto.pbkdf2Sync('prancypoodle', 'sherylcrowe', 10000, 32, 'sha512');
const { ALGORITHM } = require('../config/env');
let buffer = require('buffer');

// Use a predefined string and hash it to generate a 32-byte key
let userCustomizedKey = crypto.createHash('sha256').update("Wad-Ge-Bhaiya").digest();

const encryptData = (data) => {
    const cipher = crypto.createCipheriv(ALGORITHM, key, new Buffer('1234567812345678', 'binary'));
    let encrypted = cipher.update(data instanceof Buffer ? data : JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const decryptData = (data) => {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, new Buffer('1234567812345678', 'binary'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    try {
        return JSON.parse(decrypted);
    } catch (error) {
        return decrypted;
    }
};

const userCustomizedEncryptData = (data, eyk) => {
    console.log(eyk);
    const eykBuffer = Buffer.from(eyk, 'hex'); // Convert hexadecimal string to buffer
    console.log(eykBuffer)
    const cipher = crypto.createCipheriv(ALGORITHM, eykBuffer, new Buffer('1234567812345678', 'binary'));
    let encrypted = cipher.update(data instanceof Buffer ? data : JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const userCustomizedDecryptData = (data, eyk) => {
    console.log(eyk);
    const eykBuffer = Buffer.from(eyk, 'hex'); // Convert hexadecimal string to buffer
    console.log(eykBuffer)
    const decipher = crypto.createDecipheriv(ALGORITHM, eykBuffer, new Buffer('1234567812345678', 'binary'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    try {
        return JSON.parse(decrypted);
    } catch (error) {
        return decrypted;
    }
};

module.exports = {
    encryptData,
    decryptData,
    userCustomizedEncryptData,
    userCustomizedDecryptData,
};