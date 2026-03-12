import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db');
const url = 'file:' + dbPath.replace(/\\/g, '/');
console.log('DB:', url);

const db = createClient({ url });
try {
  await db.execute('ALTER TABLE TrainingPlanSession ADD COLUMN completed INTEGER NOT NULL DEFAULT 0');
  console.log('OK: completed column added');
} catch (e) {
  console.log('Result:', e.message);
}
db.close();
