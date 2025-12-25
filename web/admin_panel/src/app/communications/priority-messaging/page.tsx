'use client';

import { useState } from 'react';

interface Message {
    id: string;
    title: string;
    content: string;
    targetAudience: string;
    isPushNotification: boolean;
    priority: 'normal' | 'high' | 'urgent';
    sentAt: string;
    recipientCount: number;
}

export default function HighPriorityMessagingPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            title: 'Protest blocking downtown',
            content: 'Avoid downtown area due to ongoing protest. Use alternative routes.',
            targetAudience: 'Drivers in Downtown',
            isPushNotification: true,
            priority: 'urgent',
            sentAt: '2024-12-15T20:30:00Z',
            recipientCount: 145,
        },
    ]);

    const [isComposing, setIsComposing] = useState(false);
    const [newMessage, setNewMessage] = useState({
        title: '',
        content: '',
        targetAudience: 'all',
        isPushNotification: false,
        priority: 'normal' as 'normal' | 'high' | 'urgent',
    });

    const handleSendMessage = () => {
        const message: Message = {
            id: Date.now().toString(),
            ...newMessage,
            sentAt: new Date().toISOString(),
            recipientCount: Math.floor(Math.random() * 500) + 50,
        };

        setMessages([message, ...messages]);
        setIsComposing(false);
        setNewMessage({
            title: '',
            content: '',
            targetAudience: 'all',
            isPushNotification: false,
            priority: 'normal',
        });

        alert('Message sent successfully!');
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            normal: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800',
        };
        return colors[priority as keyof typeof colors];
    };

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Priority Messaging</h1>
                        <p className="text-gray-600 mt-2">
                            Send high-priority messages with push notifications
                        </p>
                    </div>
                    <button
                        onClick={() => setIsComposing(true)}
                        className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-bold flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New Message</span>
                    </button>
                </div>

                {/* Compose Modal */}
                {isComposing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">Compose Priority Message</h2>
                                        <p className="text-red-100 mt-1">Send critical updates to users</p>
                                    </div>
                                    <button
                                        onClick={() => setIsComposing(false)}
                                        className="text-white hover:bg-red-800 rounded-lg p-2 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={newMessage.title}
                                        onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="e.g., Traffic Alert: Downtown Area"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{newMessage.title.length}/60 characters</p>
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message Content *
                                    </label>
                                    <textarea
                                        value={newMessage.content}
                                        onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Enter the full message content..."
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{newMessage.content.length}/500 characters</p>
                                </div>

                                {/* Target Audience */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Target Audience *
                                    </label>
                                    <select
                                        value={newMessage.targetAudience}
                                        onChange={(e) => setNewMessage({ ...newMessage, targetAudience: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="drivers">All Drivers</option>
                                        <option value="passengers">All Passengers</option>
                                        <option value="active-drivers">Active Drivers Only</option>
                                        <option value="region">Specific Region</option>
                                    </select>
                                </div>

                                {/* Priority Level */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Priority Level *
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { value: 'normal', label: 'Normal', icon: '📢', color: 'blue' },
                                            { value: 'high', label: 'High', icon: '⚠️', color: 'orange' },
                                            { value: 'urgent', label: 'Urgent', icon: '🚨', color: 'red' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setNewMessage({ ...newMessage, priority: option.value as any })}
                                                className={`p-4 rounded-lg border-2 transition-all ${newMessage.priority === option.value
                                                        ? `border-${option.color}-600 bg-${option.color}-50`
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-2">{option.icon}</div>
                                                <div className="text-sm font-semibold">{option.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Push Notification Toggle */}
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-2 border-red-200">
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newMessage.isPushNotification}
                                            onChange={(e) => setNewMessage({ ...newMessage, isPushNotification: e.target.checked })}
                                            className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                                <span className="font-semibold text-gray-900">Send Push Notification</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Users will receive an immediate push notification on their device. Use for critical, time-sensitive messages only.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* Preview */}
                                {newMessage.isPushNotification && newMessage.title && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Push Notification Preview
                                        </label>
                                        <div className="bg-gray-900 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white">Cabi</p>
                                                    <p className="text-sm text-white mt-1">{newMessage.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1">now</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex items-center justify-between border-t border-gray-200">
                                <button
                                    onClick={() => setIsComposing(false)}
                                    className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.title || !newMessage.content}
                                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    <span>Send Message</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Sent Messages</h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {messages.map((message) => (
                            <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{message.title}</h3>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                                                {message.priority.toUpperCase()}
                                            </span>
                                            {message.isPushNotification && (
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center space-x-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                    <span>PUSH</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-700 mb-3">{message.content}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>📍 {message.targetAudience}</span>
                                            <span>👥 {message.recipientCount} recipients</span>
                                            <span>🕐 {new Date(message.sentAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
