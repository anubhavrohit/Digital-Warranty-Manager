import fs from 'fs';
import path from 'path';
import { UserProfile, WarrantyItem, DocumentItem } from '@/types';

interface DBData {
  users: UserProfile[];
  warranties: WarrantyItem[];
  documents: DocumentItem[];
}

const dbFilePath = path.join(process.cwd(), 'data', 'db.json');

// Helper to ensure data directory and file exist
function ensureDBExists(): DBData {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(dbFilePath)) {
    const initialData: DBData = { users: [], warranties: [], documents: [] };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(content) as DBData;
  } catch (err) {
    const initialData: DBData = { users: [], warranties: [], documents: [] };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export function readDB(): DBData {
  return ensureDBExists();
}

export function writeDB(data: DBData): void {
  ensureDBExists();
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}
