import { NextRequest, NextResponse } from 'next/server';
import { getUsers, setCurrentUser } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action, name } = await request.json();
    const users = getUsers();

    if (action === 'register') {
      if (users.find(u => u.email === email)) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
      if (password.length < 4) {
        return NextResponse.json({ error: 'Password too short' }, { status: 400 });
      }
      const newUser = {
        id: String(Date.now()),
        name,
        email,
        role: 'member' as const,
        avatar: name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        department: 'General',
      };
      setCurrentUser(newUser);
      return NextResponse.json({ user: newUser, token: `token-${newUser.id}` }, { status: 201 });
    }

    const user = users.find(u => u.email === email);
    if (!user || password.length < 4) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    setCurrentUser(user);
    return NextResponse.json({ user, token: `token-${user.id}` });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
