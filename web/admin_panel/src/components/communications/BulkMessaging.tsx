import React, { useState } from 'react';
import { adminService } from '../../services/adminService';

export const BulkMessaging: React.FC = () => {
    const [segment, setSegment] = useState('ALL_USERS');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            await adminService.sendBulkMessage(segment, subject, body);
            alert('Message queued successfully!');
            setSubject('');
            setBody('');
        } catch (e) {
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Send Bulk Message</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Target Segment</label>
                    <select
                        value={segment}
                        onChange={(e) => setSegment(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="ALL_USERS">All Users</option>
                        <option value="ALL_DRIVERS">All Drivers</option>
                        <option value="ALL_PASSENGERS">All Passengers</option>
                        <option value="ACTIVE_DRIVERS">Active Drivers</option>
                        <option value="UPLOAD_CSV">Upload User List (CSV)</option>
                    </select>
                </div>

                {/* Story 79.9: CSV Upload */}
                {segment === 'UPLOAD_CSV' && (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                        <input
                            type="file"
                            accept=".csv"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">File must contain a column named 'user_id'.</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        placeholder="Important Announcement"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Message Body</label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={6}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        placeholder="Enter your message here..."
                    />
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSend}
                        disabled={sending || !subject || !body}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {sending ? 'Queueing Message...' : 'Send Message'}
                    </button>
                </div>
            </div>
        </div>
    );
};
