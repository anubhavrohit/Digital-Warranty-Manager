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
    const { action, name, email, password, uid } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = readDB();
    const lowerEmail = email.toLowerCase().trim();

    if (action === 'login') {
      const user = db.users.find(
        (u) => u.email.toLowerCase() === lowerEmail || (uid && u.uid === uid)
      );

      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email address. Please register.' },
          { status: 404 }
        );
      }

      if (user.password && password && user.password !== password) {
        return NextResponse.json(
          { error: 'Invalid password. Please check your credentials.' },
          { status: 401 }
        );
      }

      const { password: _, ...cleanProfile } = user;
      return NextResponse.json({ user: cleanProfile });
    }

    if (action === 'register') {
      const existingUser = db.users.find((u) => u.email.toLowerCase() === lowerEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email address already exists.' },
          { status: 400 }
        );
      }
    }

    const cleanUid = uid || 'user-' + btoa(lowerEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const existingIndex = db.users.findIndex((u) => u.uid === cleanUid);

    const userProfile: UserProfile = {
      uid: cleanUid,
      name: name || email.split('@')[0],
      email: lowerEmail,
      createdAt: new Date().toISOString(),
      password: password || undefined,
    };

    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...userProfile };
    } else {
      db.users.push(userProfile);
    }

    writeDB(db);

    const { password: _, ...cleanProfile } = userProfile;
    return NextResponse.json({ user: cleanProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, avatarUrl, phone, currency, notificationPrefs, password } = body;

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    const db = readDB();
    const index = db.users.findIndex((u) => u.uid === uid);
    if (index >= 0) {
      if (name !== undefined) db.users[index].name = name;
      if (avatarUrl !== undefined) db.users[index].avatarUrl = avatarUrl;
      if (phone !== undefined) db.users[index].phone = phone;
      if (currency !== undefined) db.users[index].currency = currency;
      if (notificationPrefs !== undefined) db.users[index].notificationPrefs = notificationPrefs;
      if (password !== undefined) db.users[index].password = password;

      writeDB(db);

      const { password: _, ...cleanProfile } = db.users[index];
      return NextResponse.json({ user: cleanProfile });
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
