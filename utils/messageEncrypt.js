module.exports = function() {
  const crypto = require('crypto');
  const key = require('../data/keys/messageKey').key;
  const IV_LENGTH = 16;
  const deafultAlg = 'aes-256-cbc';


  let module = {};

  let encrypt = module.encrypt = function(text, algorithm = deafultAlg) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'base64'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  let decrypt = module.decrypt = function(text, algorithm = deafultAlg) {
    const [iv, encryptedText] = text.split(':').map(part => Buffer.from(part, 'hex'));
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'base64'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  return module;
}