import React, { useState, useEffect } from 'react';

interface SuspendedUser {
  id: string;
  name: string;
  phoneNumber: string;
  reason: string;
  suspendedAt: string;
}

export const SuspendedAccountManagement: React.FC = () => {
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([]);
  const [userToReactivate, setUserToReactivate] = useState<SuspendedUser | null>(null);

  useEffect(() => {
    // Mock Data
    setSuspendedUsers([
      {
        id: 'u1',
        name: 'Alice Driver',
        phoneNumber: '+254712345678',
        reason: 'BIOMETRIC_FAILURE',
        suspendedAt: '2024-05-20',
      },
      {
        id: 'u2',
        name: 'Bob Rider',
        phoneNumber: '+254787654321',
        reason: 'PAYMENT_FRAUD',
        suspendedAt: '2024-05-22',
      },
    ]);
  }, []);

  const handleReactivateClick = (user: SuspendedUser) => {
    setUserToReactivate(user);
  };

  const confirmReactivation = async () => {
    if (!userToReactivate) return;

    console.log(`Reactivating user ${userToReactivate.id}`);
    // API Call: POST /admin/users/{id}/unsuspend
    
    // Optimistic update
    setSuspendedUsers((prev) => prev.filter((u) => u.id !== userToReactivate.id));
    setUserToReactivate(null);
    alert(`User ${userToReactivate.name} has been reactivated.`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Suspended Accounts</h1>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Suspended</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suspendedUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.phoneNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    {user.reason}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.suspendedAt}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleReactivateClick(user)} 
                    className="text-green-600 hover:text-green-900 font-bold"
                  >
                    Reactivate
                  </button>
                </td>
              </tr>
            ))}
            {suspendedUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No suspended accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {userToReactivate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4">Confirm Reactivation</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reactivate <strong>{userToReactivate.name}</strong>? 
              This will restore their access to the platform immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToReactivate(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmReactivation}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm Reactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};