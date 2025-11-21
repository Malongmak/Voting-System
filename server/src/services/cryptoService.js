import { generateKeyPairSync, publicEncrypt, privateDecrypt, createHash } from 'crypto';
import config from '../config.js';
import { loadJson, saveJson } from '../utils/fileStore.js';

let cachedKeys = null;

export async function getKeyPair() {
  if (cachedKeys) return cachedKeys;
  let keys = await loadJson(config.dataPaths.keyPair, null);

  if (!keys || !keys.publicKey || !keys.privateKey) {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    keys = { publicKey, privateKey, generatedAt: new Date().toISOString() };
    await saveJson(config.dataPaths.keyPair, keys);
  }
  cachedKeys = keys;
  return keys;
}

export async function encryptBallotPayload(payload) {
  const { publicKey } = await getKeyPair();
  const buffer = Buffer.from(JSON.stringify(payload), 'utf-8');
  const encrypted = publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
}

export async function decryptBallotPayload(ciphertext) {
  const { privateKey } = await getKeyPair();
  const buffer = Buffer.from(ciphertext, 'base64');
  const decrypted = privateDecrypt(privateKey, buffer);
  return JSON.parse(decrypted.toString('utf-8'));
}

export function hashPin(pin) {
  return createHash('sha1').update(pin).digest('hex');
}

