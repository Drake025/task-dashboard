import { NextRequest, NextResponse } from 'next/server';
import { getTasks, addTask, updateTask, deleteTask } from '@/lib/data';

export async function GET() {
  return NextResponse.json(getTasks());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = addTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const task = updateTask(id, updates);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const success = deleteTask(id);
    if (!success) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
