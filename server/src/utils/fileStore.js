import { readFile, writeFile } from 'fs/promises';

export async function loadJson(pathUrl, fallback = null) {
  try {
    const data = await readFile(pathUrl, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (fallback !== null) {
      return fallback;
    }
    throw error;
  }
}

export async function saveJson(pathUrl, data) {
  await writeFile(pathUrl, JSON.stringify(data, null, 2), 'utf-8');
}

export async function appendAudit(pathUrl, entry) {
  const log = await loadJson(pathUrl, []);
  log.push({ ...entry, at: new Date().toISOString() });
  await saveJson(pathUrl, log);
}

