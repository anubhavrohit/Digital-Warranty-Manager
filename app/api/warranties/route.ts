import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db-store';
import { WarrantyItem } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const db = readDB();
  if (userId) {
    const list = db.warranties.filter((w) => w.userId === userId);
    return NextResponse.json({ warranties: list });
  }

  return NextResponse.json({ warranties: db.warranties });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = readDB();

    const now = new Date().toISOString();
    const newItem: WarrantyItem = {
      ...body,
      id: body.id || 'w-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    const existingIndex = db.warranties.findIndex((w) => w.id === newItem.id);
    if (existingIndex >= 0) {
      db.warranties[existingIndex] = newItem;
    } else {
      db.warranties.unshift(newItem);
    }
    writeDB(db);

    return NextResponse.json({ warranty: newItem });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const db = readDB();
    const index = db.warranties.findIndex((w) => w.id === id);

    if (index >= 0) {
      db.warranties[index] = {
        ...db.warranties[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      writeDB(db);
      return NextResponse.json({ warranty: db.warranties[index] });
    }

    return NextResponse.json({ error: 'Warranty not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Id is required' }, { status: 400 });
    }

    const db = readDB();
    db.warranties = db.warranties.filter((w) => w.id !== id);
    writeDB(db);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
