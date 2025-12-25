'use client';

import { useState, useEffect } from 'react';

// Mock API call function
async function fetchUserDetails(userId: string) {
  console.log(`Fetching details for user ${userId}...`);
  return {
    id: userId,
    name: 'Driver One',
    email: 'driver@company.com',
    phone: '+1-202-555-0104',
    role: 'Driver',
    status: 'Active',
    averageRating: 4.8,
    recentRides: [
      { id: 'ride-1', date: '2024-08-15', status: 'Completed', fare: 250 },
      { id: 'ride-2', date: '2024-08-14', status: 'Completed', fare: 150 },
      { id: 'ride-3', date: '2024-08-13', status: 'Cancelled', fare: 0 },
    ],
  };
}

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails(params.userId).then(data => {
      setUser(data);
      setIsLoading(false);
    });
  }, [params.userId]);

  const handleStatusChange = async (newStatus: 'Suspended' | 'Deactivated') => {
    const reason = prompt(`Please provide a reason for setting status to "${newStatus}":`);
    if (!reason) {
      alert('A reason is required.');
      return;
    }

    console.log(`Setting status to ${newStatus} for user ${user.id} with reason: ${reason}`);
    // In a real app, this would be a fetch() call to the backend PUT /users/:id/status
    setUser({ ...user, status: newStatus });
    alert(`User has been ${newStatus.toLowerCase()}.`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div>
      <h1>User Profile: {user.name}</h1>
      <div>
        <button onClick={() => handleStatusChange('Suspended')}>Suspend Account</button>
        <button onClick={() => handleStatusChange('Deactivated')} style={{ marginLeft: '10px', backgroundColor: 'darkred', color: 'white' }}>Deactivate Account</button>
      </div>

      {/* Simple Tab-like structure */}
      <div style={{ marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h2 style={{ display: 'inline-block', marginRight: '20px' }}>User Information</h2>
      </div>

      <h2>User Information</h2>
      <ul>
        <li><strong>Email:</strong> {user.email}</li>
        <li><strong>Phone:</strong> {user.phone}</li>
        <li><strong>Role:</strong> {user.role}</li>
        <li><strong>Status:</strong> <span style={{ color: user.status !== 'Active' ? 'red' : 'green', fontWeight: 'bold' }}>{user.status}</span></li>
        {user.role === 'Driver' && <li><strong>Average Rating:</strong> {user.averageRating}</li>}
      </ul>

      <h2>Recent Ride History</h2>
      <table>
        <thead>
          <tr>
            <th>Ride ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Fare</th>
          </tr>
        </thead>
        <tbody>
          {user.recentRides.map((ride) => (
            <tr key={ride.id}>
              <td>{ride.id}</td>
              <td>{ride.date}</td>
              <td>{ride.status}</td>
              <td>{ride.fare.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}