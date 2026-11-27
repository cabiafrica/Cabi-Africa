import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../common/PageHeader';
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
            <PageHeader
                category="Growth & Platform"
                title="Bulk Messaging Center"
                subtitle="Broadcast announcements, operational updates, and notifications to targeted user segments"
                icon={<Message className="w-5 h-5 text-amber-500" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Form Section */}
                <div className="md:col-span-2 bg-[#131722] rounded-[3px] shadow-sm border border-white/10 p-5 md:p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                                <Groups fontSize="small" className="text-gray-400" />
                                Target Audience
                            </label>
                            <select
                                value={segment}
                                onChange={(e) => setSegment(e.target.value)}
                                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all"
                            >
                                <option value="ALL_USERS">All Users (Global)</option>
                                <option value="ALL_DRIVERS">All Drivers</option>
                                <option value="ALL_PASSENGERS">All Passengers</option>
                                <option value="ACTIVE_DRIVERS">Active Drivers (Last 24h)</option>
                                <option value="UPLOAD_CSV">Custom List (CSV Upload)</option>
                            </select>
                        </div>

                        {segment === 'UPLOAD_CSV' && (
                            <div className="bg-[#0a0a0a] p-4 rounded-[3px] border border-amber-500/30 border-dashed animate-in fade-in zoom-in-95">
                                <label className="block text-xs font-semibold text-amber-400 mb-2 flex items-center gap-2">
                                    <UploadFile fontSize="small" />
                                    Upload Recipients CSV
                                </label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-[3px] file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 transition-all cursor-pointer"
                                />
                                <p className="mt-2 text-[11px] text-gray-500">
                                    File must contain a column header named <code className="bg-[#131722] border border-white/10 px-1 py-0.5 rounded-[3px] text-amber-400">user_id</code>.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                                <Title fontSize="small" className="text-gray-400" />
                                Subject Line
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-500"
                                placeholder="e.g., Important Update: New Bonus Structure"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                                <Subject fontSize="small" className="text-gray-400" />
                                Message Body
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none placeholder:text-slate-500"
                                placeholder="Type your message here..."
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSend}
                                disabled={sending || success || !subject || !body}
                                className="btn-primary w-full flex justify-center items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        <span>Queueing Message...</span>
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle fontSize="small" />
                                        <span>Sent Successfully!</span>
                                    </>
                                ) : (
                                    <>
                                        <Send fontSize="small" />
                                        <span>Send Broadcast</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info / Preview Panel */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-[#131722] p-5 rounded-[3px] border border-white/10 h-full">
                        <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Tips &amp; Guidelines</h3>
                        <ul className="space-y-2.5 text-xs text-gray-400">
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

                        <div className="mt-6 pt-5 border-t border-white/10">
                            <h4 className="font-semibold text-gray-400 text-[10px] uppercase tracking-wide mb-1.5">Estimated Reach</h4>
                            <div className="text-2xl font-bold text-white">
                                {segment === 'ALL_USERS' ? '12.5k' : segment === 'ALL_DRIVERS' ? '3,420' : segment === 'ACTIVE_DRIVERS' ? '850' : '--'}
                                <span className="text-xs font-normal text-gray-400 ml-1.5">recipients</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
