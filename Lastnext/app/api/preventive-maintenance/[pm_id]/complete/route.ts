import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { pm_id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const api = await connectToDatabase();

    // Get the current maintenance record
    const response = await api.get(`/preventive-maintenance/${params.pm_id}/`);
    const maintenance = response.data;

    if (!maintenance) {
      return NextResponse.json(
        { error: 'Preventive maintenance not found' },
        { status: 404 }
      );
    }

    // Calculate next due date based on frequency
    const completedDate = new Date();
    let nextDueDate = new Date(completedDate);

    switch (maintenance.frequency) {
      case 'daily':
        nextDueDate.setDate(nextDueDate.getDate() + 1);
        break;
      case 'weekly':
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDueDate.setDate(nextDueDate.getDate() + 14);
        break;
      case 'monthly':
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDueDate.setMonth(nextDueDate.getMonth() + 3);
        break;
      case 'biannually':
        nextDueDate.setMonth(nextDueDate.getMonth() + 6);
        break;
      case 'annually':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        break;
      case 'custom':
        if (maintenance.custom_days) {
          nextDueDate.setDate(nextDueDate.getDate() + maintenance.custom_days);
        }
        break;
    }

    // Update the maintenance record
    const result = await api.patch(`/preventive-maintenance/${params.pm_id}/complete/`, {
      completed_date: completedDate.toISOString(),
      next_due_date: nextDueDate.toISOString(),
      status: 'completed',
      completion_notes: data.completion_notes,
      after_image: data.after_image
    });

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error: any) {
    console.error('Error in preventive maintenance completion:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 