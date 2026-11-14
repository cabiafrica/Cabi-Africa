import React, { useState } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

export const CorporateEmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'e1', name: 'Alice Williams', email: 'alice@acme.com', status: 'ACTIVE' },
    { id: 'e2', name: 'Bob Miller', email: 'bob@acme.com', status: 'ACTIVE' },
    { id: 'e3', name: 'Pending User', email: 'new@acme.com', status: 'PENDING' },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    // Simulate API
    const newEmployee: Employee = {
      id: `e${Date.now()}`,
      name: 'Invited User',
      email: inviteEmail,
      status: 'PENDING'
    };
    setEmployees([...employees, newEmployee]);
    setInviteEmail('');
    alert(`Invitation sent to ${inviteEmail}`);
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Are you sure you want to remove this employee from the corporate account?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Employee Management</h1>

      {/* Invite Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Add Employee</h2>
        <form onSubmit={handleInvite} className="flex gap-4">
          <input 
            type="email" 
            placeholder="Employee Email Address" 
            className="flex-1 border rounded px-4 py-2"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
          />
          <button type="submit" className="bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-700">
            Send Invite
          </button>
        </form>
      </div>

      {/* Employee List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map(emp => (
              <tr key={emp.id}>
                <td className="px-6 py-4 font-medium">{emp.name}</td>
                <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    emp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    emp.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>{emp.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleRemove(emp.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};