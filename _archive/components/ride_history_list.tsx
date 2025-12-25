'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Ride {
  id: string;
  pickupLocation: string;
  destination: string;
  finalFare: number;
  status: string;
  date: string;
}

// Mock service - in a real app, this would be an API call
const getRideHistory = async (userId: string): Promise<Ride[]> => {
  console.log(`Fetching ride history for user ${userId}...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 'ride-1', pickupLocation: '123 Main St', destination: '456 Oak Ave', finalFare: 15.75, status: 'Completed', date: '2024-08-10T10:00:00Z' },
    { id: 'ride-2', pickupLocation: '789 Pine Ln', destination: '101 Maple Dr', finalFare: 22.50, status: 'Completed', date: '2024-08-09T14:30:00Z' },
    { id: 'ride-3', pickupLocation: '210 Birch Rd', destination: '333 Elm St', finalFare: 0, status: 'Cancelled', date: '2024-08-08T09:00:00Z' },
  ];
};

export default function RideHistoryList({ userId }: { userId: string }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRideHistory(userId).then(data => {
      setRides(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <p>Loading ride history...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Fare</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rides.map((ride) => (
          <TableRow key={ride.id}>
            <TableCell>{new Date(ride.date).toLocaleDateString()}</TableCell>
            <TableCell>{ride.pickupLocation}</TableCell>
            <TableCell>{ride.destination}</TableCell>
            <TableCell>
              <Badge variant={ride.status === 'Completed' ? 'default' : 'secondary'}>{ride.status}</Badge>
            </TableCell>
            <TableCell>KES {ride.finalFare.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              <Link href={`/rides/${ride.id}`} passHref>
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}