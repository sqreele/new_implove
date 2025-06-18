import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import apiClient from '@/app/lib/api-client';

export async function GET(
  request: Request,
  { params }: { params: { room_id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await apiClient.get(`/api/rooms/${params.room_id}/`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch room' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { room_id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const response = await apiClient.patch(`/api/rooms/${params.room_id}/`, data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update room' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { room_id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await apiClient.delete(`/api/rooms/${params.room_id}/`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete room' },
      { status: error.response?.status || 500 }
    );
  }
} 