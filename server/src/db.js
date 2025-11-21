import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import config from './config.js';
import { loadJson } from './utils/fileStore.js';

let dbPromise;

export function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: config.databasePath,
      driver: sqlite3.Database
    }).then(async (db) => {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS voters (
          studentId TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          grade TEXT,
          pinHash TEXT NOT NULL,
          phone TEXT,
          faceTemplate TEXT,
          fingerprintTemplate TEXT,
          votedAt TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const row = await db.get('SELECT COUNT(*) as count FROM voters');
      if (row.count === 0) {
        const seeded = await loadJson(config.dataPaths.voters, []);
        const stmt = await db.prepare(`
          INSERT OR REPLACE INTO voters (studentId, name, grade, pinHash, faceTemplate)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const voter of seeded) {
          await stmt.run(
            voter.studentId,
            voter.name,
            voter.grade || null,
            voter.pinHash,
            voter.faceTemplate || null
          );
        }
        await stmt.finalize();
      }

      await db.exec(`
        CREATE TRIGGER IF NOT EXISTS voters_update_timestamp
        AFTER UPDATE ON voters
        BEGIN
          UPDATE voters SET updatedAt = CURRENT_TIMESTAMP WHERE studentId = NEW.studentId;
        END;
      `);

      return db;
    });
  }
  return dbPromise;
}

