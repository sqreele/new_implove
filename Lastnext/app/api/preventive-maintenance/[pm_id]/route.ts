import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { apiClient } from '@/app/lib/api-client';

export async function GET(
  request: Request,
  { params }: { params: { pm_id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await apiClient.get(`/api/preventive-maintenance/${params.pm_id}/`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching preventive maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preventive maintenance' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { pm_id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const response = await apiClient.patch(`/api/preventive-maintenance/${params.pm_id}/`, data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating preventive maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to update preventive maintenance' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { pm_id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await apiClient.delete(`/api/preventive-maintenance/${params.pm_id}/`);
    return NextResponse.json({ message: 'Preventive maintenance deleted successfully' });
  } catch (error) {
    console.error('Error deleting preventive maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to delete preventive maintenance' },
      { status: 500 }
    );
  }
} 