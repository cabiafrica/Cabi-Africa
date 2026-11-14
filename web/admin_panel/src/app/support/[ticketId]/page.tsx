import React, { useState } from 'react';

const mockTicket = {
    id: '12345',
    subject: 'Issue with double charge',
    status: 'open',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    createdAt: '2023-10-26 10:30 AM',
    priority: 'High',
    messages: [
        { from: 'user', text: 'I was charged twice for my order. Can you help?', timestamp: '2023-10-26 10:30 AM' },
        { from: 'agent', text: 'Hello! I\'m looking into this now.', timestamp: '2023-10-26 10:45 AM' },
    ],
};

export default function TicketDetailPage({ params }: { params: { ticketId: string } }) {
    const [ticket, setTicket] = useState<any>(mockTicket);
    const [replyText, setReplyText] = useState('');
    const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);

    const knowledgeBaseArticles = [
        { id: '1', title: 'How to request a refund', category: 'Payments' },
        { id: '2', title: 'Cancellation policy explained', category: 'Policies' },
        { id: '3', title: 'How to update payment method', category: 'Account' },
    ];

    const insertArticleLink = (article: any) => {
        setReplyText(prev => prev + `\n\nHere's a helpful article: ${article.title}\nLink: https://help.example.com/articles/${article.id}`);
        setShowKnowledgeBase(false);
    };

    const sendReply = () => {
        if (replyText.trim() === '') return;
        const newMessages = [...ticket.messages, { from: 'agent', text: replyText, timestamp: new Date().toLocaleString() }];
        setTicket({ ...ticket, messages: newMessages });
        setReplyText('');
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Ticket #{ticket.id}</h1>
                    <p className="text-gray-600">{ticket.subject}</p>
                </div>
                <select
                    value={ticket.status}
                    onChange={(e) => setTicket({ ...ticket, status: e.target.value })}
                    className="border rounded px-3 py-2"
                >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    {ticket.messages.map((msg: any, i: number) => (
                        <div key={i} className={`p-4 rounded ${msg.from === 'user' ? 'bg-gray-100' : 'bg-amber-50'}`}>
                            <div className="font-bold mb-2">{msg.from === 'user' ? ticket.userName : 'Support Agent'}</div>
                            <p>{msg.text}</p>
                            <p className="text-xs text-gray-500 mt-2">{msg.timestamp}</p>
                        </div>
                    ))}

                    <div className="bg-white p-4 rounded shadow">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">Reply</h3>
                            <button
                                onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
                                className="text-sm text-amber-600 hover:underline"
                            >
                                📚 Search Knowledge Base
                            </button>
                        </div>

                        {showKnowledgeBase && (
                            <div className="mb-4 p-3 bg-gray-50 rounded border">
                                <h4 className="font-medium mb-2">Insert Help Article</h4>
                                {knowledgeBaseArticles.map(article => (
                                    <button
                                        key={article.id}
                                        onClick={() => insertArticleLink(article)}
                                        className="block w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                                    >
                                        {article.title} <span className="text-gray-500">({article.category})</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full border rounded p-3 mb-2"
                            rows={4}
                            placeholder="Type your reply..."
                        />
                        <button
                            onClick={sendReply}
                            className="bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-700"
                        >
                            Send Reply
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="font-bold mb-3">Ticket Info</h3>
                        <div className="space-y-2 text-sm">
                            <div><strong>User:</strong> {ticket.userName}</div>
                            <div><strong>Email:</strong> {ticket.userEmail}</div>
                            <div><strong>Created:</strong> {ticket.createdAt}</div>
                            <div><strong>Priority:</strong> {ticket.priority}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
