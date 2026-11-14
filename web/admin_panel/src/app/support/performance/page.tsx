import React from 'react';

export default function AgentPerformance() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Agent Performance Dashboard</h1>

            <div className="grid grid-cols-4 gap-4 mb-8">
                <Card title="Avg Response Time" value="45m" color="bg-amber-50" />
                <Card title="Tickets Resolved (24h)" value="124" color="bg-green-50" />
                <Card title="Avg CSAT Score" value="4.8/5.0" color="bg-yellow-50" />
                <Card title="SLA Breaches" value="2" color="bg-red-50" />
            </div>

            <h2 className="text-lg font-bold mb-4">Agent Leaderboard</h2>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-3 text-left">Agent</th>
                        <th className="p-3 text-left">Resolved</th>
                        <th className="p-3 text-left">CSAT</th>
                        <th className="p-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <Row name="Alice Agent" resolved="45" csat="4.9" status="Online" />
                    <Row name="Bob Builder" resolved="38" csat="4.7" status="Away" />
                    <Row name="Charlie Chat" resolved="41" csat="4.8" status="Online" />
                </tbody>
            </table>
        </div>
    );
}

function Card({ title, value, color }: any) {
    return (
        <div className={`p-4 rounded shadow ${color}`}>
            <h3 className="text-sm font-bold text-gray-500 uppercase">{title}</h3>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
    );
}

function Row({ name, resolved, csat, status }: any) {
    return (
        <tr className="border-b">
            <td className="p-3 font-medium">{name}</td>
            <td className="p-3">{resolved}</td>
            <td className="p-3">{csat}</td>
            <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs ${status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {status}
                </span>
            </td>
        </tr>
    );
}
