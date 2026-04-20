const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const keySeed = process.env.CREDENTIAL_SECRET || 'replace-this-with-a-32-byte-secret';
const key = crypto.createHash('sha256').update(String(keySeed)).digest();
const iv = Buffer.alloc(16, 0);

function decryptValue(value) {
  if (!value || value.startsWith('PLACEHOLDER_')) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(value, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf-8');
  } catch (error) {
    return null;
  }
}

function encryptValue(value) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf-8'), cipher.final()]);
  return encrypted.toString('base64');
}

module.exports = {
  decryptValue,
  encryptValue,
};
