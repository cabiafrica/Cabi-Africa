import React, { useState, useEffect } from 'react';

// Mock Socket
const mockSocket = {
    on: (event: string, cb: any) => {
        // Simulate an incoming alert after 5 seconds
        if (event === 'sos_alert') {
            setTimeout(() => cb({
                id: 'alert_new',
                userId: 'passenger_jane',
                userType: 'PASSENGER',
                location: { lat: 0, lng: 0 },
                tripId: 'trip_999',
                timestamp: new Date(),
                status: 'NEW'
            }), 5000);
        }
    },
    off: (_event: string) => { /* No-op */ }
};

export default function SOSDashboard() {
    const [alerts, setAlerts] = useState<any[]>([
        { id: '1', userId: 'driver_bob', userType: 'DRIVER', timestamp: new Date(), status: 'NEW', tripId: 'trip_123' }
    ]);

    useEffect(() => {
        // Subscribe to socket
        mockSocket.on('sos_alert', (newAlert: any) => {
            setAlerts(prev => [newAlert, ...prev]);
            // Play sound?
            alert("NEW SOS ALERT!");
        });
        return () => { mockSocket.off('sos_alert'); }
    }, []);

    const acknowledge = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
        // API call
    };

    return (
        <div className="p-6 bg-red-50 min-h-screen">
            <h1 className="text-3xl font-bold text-red-700 mb-6">🚨 SOS ALERTS DASHBOARD</h1>

            <div className="grid gap-4">
                {alerts.map(a => (
                    <div key={a.id} className={`p-6 rounded shadow border-l-8 ${a.status === 'NEW' ? 'bg-white border-red-600 animate-pulse' : 'bg-gray-100 border-gray-400'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">{a.userType} SOS: {a.userId}</h2>
                                <p className="text-gray-600">Trip ID: {a.tripId}</p>
                                <p className="text-sm text-gray-500">{new Date(a.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded font-bold ${a.status === 'NEW' ? 'bg-red-600 text-white' : 'bg-gray-300'}`}>
                                    {a.status}
                                </span>
                            </div>
                        </div>

                        {a.status === 'NEW' && (
                            <div className="mt-4 flex gap-4">
                                <button onClick={() => acknowledge(a.id)} className="bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700">
                                    ACKNOWLEDGE & DISPATCH SUPPORT TO {a.tripId}
                                </button>
                                <button className="bg-blue-600 text-white px-6 py-3 rounded font-bold">
                                    VIEW ON MAP
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
