import React from 'react';

// Mock data (would fetch from API using params.id)
const mockTicket = {
    id: '123',
    user: 'Bob Jones',
    status: 'Open',
    messages: [
        { id: 1, sender: 'User', text: 'Where is my refund?', time: '10:00 AM' },
        { id: 2, sender: 'Agent', text: 'Checking now...', time: '10:05 AM' }
    ]
};

const mockContext = {
    user: {
        id: 'u_1',
        name: 'Bob Jones',
        email: 'bob@example.com',
        rating: 4.8,
        memberSince: '2023',
        totalTrips: 45
    },
    lastTrip: {
        id: 't_99',
        date: 'Today',
        route: 'JFK -> Downtown',
        amount: '$55.00'
    }
};

export default function TicketDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col border-r bg-white m-4 rounded shadow">
                <div className="p-4 border-b flex justify-between">
                    <h2 className="font-bold text-lg">Ticket #{params.id} - {mockTicket.user}</h2>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{mockTicket.status}</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {mockTicket.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'Agent' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-sm ${msg.sender === 'Agent' ? 'bg-amber-500 text-black' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-xs mt-1 ${msg.sender === 'Agent' ? 'text-amber-100' : 'text-gray-500'}`}>{msg.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <input type="text" className="flex-1 border p-2 rounded" placeholder="Type a reply..." />
                        <button className="bg-amber-500 text-black px-4 py-2 rounded">Send</button>
                    </div>
                </div>
            </div>

            {/* Context Panel (Story 24.4) */}
            <div className="w-80 p-4">
                <div className="bg-white p-4 rounded shadow mb-4">
                    <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs">User Profile</h3>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div>
                            <p className="font-bold">{mockContext.user.name}</p>
                            <p className="text-xs text-gray-500">{mockContext.user.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-500">Rating</p>
                            <p className="font-bold">★ {mockContext.user.rating}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-500">Trips</p>
                            <p className="font-bold">{mockContext.user.totalTrips}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs">Related Trip</h3>
                    <div className="text-sm space-y-2">
                        <p><span className="text-gray-500">Route:</span> {mockContext.lastTrip.route}</p>
                        <p><span className="text-gray-500">Date:</span> {mockContext.lastTrip.date}</p>
                        <p><span className="text-gray-500">Fare:</span> {mockContext.lastTrip.amount}</p>
                        <button className="text-amber-600 hover:underline text-xs mt-2">View Trip Details</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
