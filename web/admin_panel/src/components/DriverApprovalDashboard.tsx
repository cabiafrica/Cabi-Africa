import React, { useState, useEffect } from 'react';

// Mock Interfaces
interface DriverProfile {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REQUIRES_CORRECTION';
  documents: { name: string; url: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }[];
}

export const DriverApprovalDashboard: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    // Simulate fetching pending drivers
    setDrivers([
      {
        id: 'd1',
        name: 'Alice Driver',
        email: 'alice@example.com',
        licenseNumber: 'LIC-12345',
        status: 'PENDING_APPROVAL',
        documents: [
          { name: 'Driving License', url: '/docs/license.pdf', status: 'PENDING' },
          { name: 'ID Card', url: '/docs/id.pdf', status: 'PENDING' },
        ],
      },
    ]);
  }, []);

  const handleApprove = async (driverId: string) => {
    console.log(`Approving driver ${driverId}`);
    // Call API: POST /admin/drivers/{id}/approve
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    setSelectedDriver(null);
  };

  const handleReject = async (driverId: string) => {
    console.log(`Requesting correction for driver ${driverId}: ${rejectionReason}`);
    // Call API: POST /admin/drivers/{id}/request-correction
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    setSelectedDriver(null);
    setRejectionReason('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Driver Approvals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-4">Pending Applications</h2>
          <ul>
            {drivers.map((driver) => (
              <li
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className={`p-3 cursor-pointer hover:bg-gray-100 rounded ${selectedDriver?.id === driver.id ? 'bg-blue-50' : ''}`}
              >
                <div className="font-medium">{driver.name}</div>
                <div className="text-sm text-gray-500">{driver.licenseNumber}</div>
              </li>
            ))}
            {drivers.length === 0 && <p className="text-gray-500">No pending drivers.</p>}
          </ul>
        </div>

        {/* Detail View */}
        <div className="md:col-span-2 bg-white shadow rounded p-6">
          {selectedDriver ? (
            <>
              <h2 className="text-xl font-bold mb-4">{selectedDriver.name}</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1">{selectedDriver.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License</label>
                  <div className="mt-1">{selectedDriver.licenseNumber}</div>
                </div>
              </div>

              <h3 className="font-semibold mb-2">Documents</h3>
              <ul className="mb-6 space-y-2">
                {selectedDriver.documents.map((doc, idx) => (
                  <li key={idx} className="flex justify-between items-center border p-2 rounded">
                    <span>{doc.name}</span>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">View</a>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Action</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedDriver.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve Application
                  </button>
                  
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Reason for rejection..."
                      className="flex-1 border rounded px-3 py-2"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <button
                      onClick={() => handleReject(selectedDriver.id)}
                      disabled={!rejectionReason}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Request Correction
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center mt-10">Select a driver to review details.</div>
          )}
        </div>
      </div>
    </div>
  );
};