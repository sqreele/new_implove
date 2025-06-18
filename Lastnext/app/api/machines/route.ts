import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Machine } from '@/app/types';

// GET /api/machines
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      property_id: searchParams.get('property_id') || undefined,
      room_id: searchParams.get('room_id') || undefined,
      is_active: searchParams.get('is_active') === 'true' ? true : 
                 searchParams.get('is_active') === 'false' ? false : undefined,
      page: Number(searchParams.get('page')) || 1,
      page_size: Number(searchParams.get('page_size')) || 10
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/machines?${new URLSearchParams(filter as any)}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching machines:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/machines
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating machine:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/machines
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { machine_id, ...updates } = data;

    if (!machine_id) {
      return NextResponse.json({ error: 'Machine ID is required' }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/machines/${machine_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating machine:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/machines
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const machine_id = searchParams.get('machine_id');

    if (!machine_id) {
      return NextResponse.json({ error: 'Machine ID is required' }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/machines/${machine_id}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting machine:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 