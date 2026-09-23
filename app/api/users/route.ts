import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db-store';
import { UserProfile } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const uid = searchParams.get('uid');

  const db = readDB();

  if (uid) {
    const user = db.users.find((u) => u.uid === uid);
    return NextResponse.json({ user: user || null });
  }

  if (email) {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return NextResponse.json({ user: user || null });
  }

  return NextResponse.json({ users: db.users });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, uid } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = readDB();
    const existingIndex = db.users.findIndex(
      (u) => u.email.toLowerCase() === email.toLowerCase() || (uid && u.uid === uid)
    );

    const userProfile: UserProfile = {
      uid: uid || 'user-' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
      name: name || email.split('@')[0],
      email: email,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...userProfile };
    } else {
      db.users.push(userProfile);
    }

    writeDB(db);
    return NextResponse.json({ user: userProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name } = body;

    const db = readDB();
    const index = db.users.findIndex((u) => u.uid === uid);
    if (index >= 0) {
      db.users[index].name = name;
      writeDB(db);
      return NextResponse.json({ user: db.users[index] });
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
