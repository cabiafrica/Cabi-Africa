import React, { useState } from 'react';

export const PushNotificationManager: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState('ALL');
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!title || !body) return alert('Please fill in all fields');
    if (!window.confirm(`Send this notification to ${segment} users?`)) return;

    setIsSending(true);
    // Simulate API
    setTimeout(() => {
      setIsSending(false);
      alert('Notification broadcast successfully!');
      setTitle('');
      setBody('');
    }, 1500);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Marketing Blasts</h1>
      
      <div className="bg-white shadow rounded p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
          <select 
            className="w-full border rounded p-2"
            value={segment}
            onChange={e => setSegment(e.target.value)}
          >
            <option value="ALL">All Users</option>
            <option value="PASSENGERS">Passengers Only</option>
            <option value="DRIVERS">Drivers Only</option>
            <option value="INACTIVE_30">Inactive (30 Days)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
          <input 
            className="w-full border rounded p-2" 
            placeholder="e.g., 50% Off Your Next Ride!"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
          <textarea 
            className="w-full border rounded p-2 h-24" 
            placeholder="Enter your marketing message here..."
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSend}
            disabled={isSending}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isSending ? 'Broadcasting...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
};