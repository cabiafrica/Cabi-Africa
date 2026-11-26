import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import {
    Send,
    Message,
    Groups,
    UploadFile,
    Title,
    Subject,
    CheckCircle
} from '@mui/icons-material';

export const BulkMessaging: React.FC = () => {
    const [segment, setSegment] = useState('ALL_USERS');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            // Simulated delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            await adminService.sendBulkMessage(segment, subject, body);
            setSuccess(true);
            setSubject('');
            setBody('');
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Message className="text-amber-600 dark:text-amber-400" />
                    Bulk Messaging Center
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Broadcast announcements and notifications to user segments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Form Section */}
                <div className="md:col-span-2 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-6 md:p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Groups fontSize="small" className="text-slate-400" />
                                Target Audience
                            </label>
                            <select
                                value={segment}
                                onChange={(e) => setSegment(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            >
                                <option value="ALL_USERS">All Users (Global)</option>
                                <option value="ALL_DRIVERS">All Drivers</option>
                                <option value="ALL_PASSENGERS">All Passengers</option>
                                <option value="ACTIVE_DRIVERS">Active Drivers (Last 24h)</option>
                                <option value="UPLOAD_CSV">Custom List (CSV Upload)</option>
                            </select>
                        </div>

                        {segment === 'UPLOAD_CSV' && (
                            <div className="bg-amber-50 dark:bg-surface-dark/50 p-4 rounded-lg border border-amber-100 dark:border-white/10 border-dashed animate-in fade-in zoom-in-95">
                                <label className="block text-sm font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                                    <UploadFile fontSize="small" />
                                    Upload Recipients CSV
                                </label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 transition-all cursor-pointer"
                                />
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    File must contain a column header named <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">user_id</code>.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Title fontSize="small" className="text-slate-400" />
                                Subject Line
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="e.g., Important Update: New Bonus Structure"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Subject fontSize="small" className="text-slate-400" />
                                Message Body
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={8}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none placeholder:text-slate-400"
                                placeholder="Type your message here..."
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSend}
                                disabled={sending || success || !subject || !body}
                                className={`w-full flex justify-center items-center gap-1.5 py-2 px-4 rounded text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-sm shadow-amber-500/20 ${success
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                            >
                                {sending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Queueing Message...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle fontSize="small" />
                                        Sent Successfully!
                                    </>
                                ) : (
                                    <>
                                        <Send fontSize="small" />
                                        Send Broadcast
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info / Preview Panel (Placeholder for now) */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-slate-50 dark:bg-card-dark/50 p-6 rounded-xl border border-slate-200 dark:border-white/10 h-full">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Tips & Guidelines</h3>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex gap-2">
                                <div className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                                Keep subjects under 50 characters for better push notification visibility.
                            </li>
                            <li className="flex gap-2">
                                <div className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                                Bulk messages are processed in queues. Delivery may take a few minutes for large segments.
                            </li>
                            <li className="flex gap-2">
                                <div className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                                Avoid using special characters that may not render correctly on all devices.
                            </li>
                        </ul>

                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wide mb-2">Estimated Reach</h4>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {segment === 'ALL_USERS' ? '12.5k' : segment === 'ALL_DRIVERS' ? '3,420' : segment === 'ACTIVE_DRIVERS' ? '850' : '--'}
                                <span className="text-sm font-normal text-slate-500 ml-2">users</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
