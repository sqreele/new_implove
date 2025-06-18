'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Room, CreateRoomData, UpdateRoomData } from '@/app/types/rooms';
import { useRouter } from 'next/navigation';

interface RoomFormProps {
  initialData?: Room;
  propertyId?: string;
  onSuccess?: (room: Room) => void;
  onCancel?: () => void;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Room name is required'),
  description: Yup.string(),
  status: Yup.string().required('Status is required'),
  property_id: Yup.string().required('Property is required'),
  floor: Yup.string(),
  type: Yup.string(),
  notes: Yup.string(),
});

export default function RoomForm({ initialData, propertyId, onSuccess, onCancel }: RoomFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'active',
      property_id: initialData?.property_id || propertyId || '',
      floor: initialData?.floor || '',
      type: initialData?.type || '',
      notes: initialData?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!session?.user?.accessToken) return;

      try {
        setIsSubmitting(true);
        setError(null);

        const data: CreateRoomData | UpdateRoomData = {
          name: values.name,
          description: values.description,
          status: values.status as 'active' | 'inactive' | 'maintenance',
          property_id: values.property_id,
          floor: values.floor,
          type: values.type,
          notes: values.notes,
        };

        const response = await fetch(
          initialData ? `/api/rooms/${initialData.room_id}` : '/api/rooms',
          {
            method: initialData ? 'PATCH' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.user.accessToken}`,
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save room');
        }

        const result = await response.json();
        onSuccess?.(result.data);
        router.push('/dashboard/rooms');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Room' : 'Create New Room'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Room Name *
            </label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status *
            </label>
            <Select
              value={formik.values.status}
              onValueChange={(value) => formik.setFieldValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <p className="text-sm text-red-500">{formik.errors.status}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="floor" className="text-sm font-medium">
              Floor
            </label>
            <Input
              id="floor"
              name="floor"
              value={formik.values.floor}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <Input
              id="type"
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 