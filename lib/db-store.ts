import fs from 'fs';
import path from 'path';
import { UserProfile, WarrantyItem, DocumentItem } from '@/types';

interface DBData {
  users: UserProfile[];
  warranties: WarrantyItem[];
  documents: DocumentItem[];
}

const dbFilePath = path.join(process.cwd(), 'data', 'db.json');

// In-memory fallback if disk is read-only
let memoryDB: DBData | null = null;

function ensureDBExists(): DBData {
  if (memoryDB) return memoryDB;

  try {
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(dbFilePath)) {
      const initialData: DBData = { users: [], warranties: [], documents: [] };
      try {
        fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
      } catch (e) {
        console.warn('DB store notice: Read-only filesystem detected, using in-memory store.');
      }
      memoryDB = initialData;
      return initialData;
    }

    const content = fs.readFileSync(dbFilePath, 'utf-8');
    memoryDB = JSON.parse(content) as DBData;
    return memoryDB;
  } catch (err) {
    const initialData: DBData = { users: [], warranties: [], documents: [] };
    memoryDB = initialData;
    return initialData;
  }
}

export function readDB(): DBData {
  return ensureDBExists();
}

export function writeDB(data: DBData): void {
  memoryDB = data;
  try {
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('DB store write notice: Read-only filesystem or write restricted.', err);
  }
}
