import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Job, JobStatus, JobPriority, JobType } from '@/app/types';

// GET /api/jobs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as JobStatus || undefined,
      priority: searchParams.get('priority') as JobPriority || undefined,
      type: searchParams.get('type') as JobType || undefined,
      assigned_to: searchParams.get('assigned_to') || undefined,
      property_id: searchParams.get('property_id') || undefined,
      room_id: searchParams.get('room_id') || undefined,
      machine_id: searchParams.get('machine_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      page: Number(searchParams.get('page')) || 1,
      page_size: Number(searchParams.get('page_size')) || 10
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?${new URLSearchParams(filter as any)}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/jobs
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/jobs
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { job_id, ...updates } = data;

    if (!job_id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${job_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/jobs
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const job_id = searchParams.get('job_id');

    if (!job_id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${job_id}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 