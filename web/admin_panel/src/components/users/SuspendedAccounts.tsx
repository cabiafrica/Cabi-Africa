import React, { useState, useEffect, useCallback } from 'react';
import { adminService, AdminUser } from '../services/adminService';

export const SuspendedAccounts: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuspendedUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSuspendedUsers();
      setUsers(data);
    } catch (error) {
      alert('Failed to fetch suspended accounts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuspendedUsers();
  }, [fetchSuspendedUsers]);

  const handleReactivate = async (userId: string) => {
    if (window.confirm('Are you sure you want to reactivate this user?')) {
      try {
        await adminService.unsuspendUser(userId);
        alert('User reactivated successfully.');
        fetchSuspendedUsers(); // Refresh the list
      } catch (error) {
        alert('Failed to reactivate user.');
      }
    }
  };

  return (
    <div>
      <h2>Suspended Accounts</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Suspension Reason</th>
              <th>Suspension Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.suspensionReason || 'N/A'}</td>
                <td>{user.suspensionDate ? new Date(user.suspensionDate).toLocaleString() : 'N/A'}</td>
                <td>
                  <button onClick={() => handleReactivate(user.id)}>Reactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};