import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db-store';
import { DocumentItem } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const db = readDB();
  if (userId) {
    const list = db.documents.filter((d) => d.userId === userId);
    return NextResponse.json({ documents: list });
  }

  return NextResponse.json({ documents: db.documents });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = readDB();

    const newDoc: DocumentItem = {
      ...body,
      id: body.id || 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      uploadedAt: body.uploadedAt || new Date().toISOString(),
    };

    const existingIndex = db.documents.findIndex((d) => d.id === newDoc.id);
    if (existingIndex >= 0) {
      db.documents[existingIndex] = newDoc;
    } else {
      db.documents.unshift(newDoc);
    }
    writeDB(db);

    return NextResponse.json({ document: newDoc });
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
    db.documents = db.documents.filter((d) => d.id !== id);
    writeDB(db);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
