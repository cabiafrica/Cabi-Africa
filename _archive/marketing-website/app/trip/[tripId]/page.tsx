'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock driver locations for simulation
const MOCK_PATH = [
    { lat: 37.7749, lng: -122.4194 },
    { lat: 37.7752, lng: -122.4200 },
    { lat: 37.7755, lng: -122.4210 },
    { lat: 37.7760, lng: -122.4220 },
    { lat: 37.7765, lng: -122.4230 }, // Arrived
];

export default function TripTrackingPage({ params }: { params: { tripId: string } }) {
    const [status, setStatus] = useState<'finding' | 'on_way' | 'arrived' | 'in_progress' | 'completed'>('finding');
    const [driver, setDriver] = useState<any>(null);
    const [eta, setEta] = useState<number | null>(null);
    const [locationIndex, setLocationIndex] = useState(0);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [saveCard, setSaveCard] = useState(false);
    const [rating, setRating] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    useEffect(() => {
        // Simulate finding a driver
        const findDriverTimer = setTimeout(() => {
            setStatus('on_way');
            setDriver({
                name: 'Michael',
                rating: 4.9,
                carModel: 'Toyota Camry',
                carColor: 'Silver',
                plate: 'ABC 1234',
                photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
                phone: '(555) 123-4567',
            });
            setEta(5);
        }, 2000);

        return () => clearTimeout(findDriverTimer);
    }, []);

    useEffect(() => {
        if (status === 'on_way' || status === 'in_progress') {
            const interval = setInterval(() => {
                setLocationIndex(prev => {
                    if (prev < MOCK_PATH.length - 1) {
                        // Decrease ETA
                        setEta(old => (old && old > 1 ? old - 1 : 1));
                        return prev + 1;
                    } else {
                        if (status === 'on_way') {
                            setStatus('arrived');
                            setTimeout(() => setStatus('in_progress'), 3000); // Simulate pickup
                            return 0; // Reset path for trip
                        } else if (status === 'in_progress') {
                            setStatus('completed');
                        }
                        return prev;
                    }
                });
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [status]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center z-10">
                <Link href="/" className="text-2xl font-bold">Cabi</Link>
                <div className="text-sm text-gray-500">Trip ID: {params.tripId}</div>
            </header>

            <main className="flex-grow relative">
                {/* Map Placeholder */}
                <div className="absolute inset-0 bg-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <span className="text-9xl font-bold text-gray-400">MAP VIEW</span>
                    </div>

                    {/* Mock Map Elements */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse ring-4 ring-blue-200"></div>
                            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow text-xs font-bold">
                                You
                            </div>
                        </div>
                    </div>

                    {driver && status !== 'completed' && (
                        <div
                            className="absolute transition-all duration-1000 ease-linear"
                            style={{
                                top: `${50 + (Math.random() * 20 - 10)}%`,
                                left: `${50 + (Math.random() * 20 - 10)}%`
                            }}
                        >
                            <div className="relative">
                                <div className="text-2xl">🚗</div>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white px-2 py-1 rounded shadow text-xs">
                                    {driver.name} ({eta} min)
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Card & Driver Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto">
                        {status === 'finding' && (
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <h2 className="text-xl font-bold">Finding your driver...</h2>
                                <p className="text-gray-500">Connecting you with nearby cars</p>
                            </div>
                        )}

                        {(status === 'on_way' || status === 'arrived' || status === 'in_progress') && driver && (
                            <div>
                                {/* Status Bar */}
                                <div className={`px-6 py-3 text-white font-bold text-center ${status === 'arrived' ? 'bg-green-500' : 'bg-black'
                                    }`}>
                                    {status === 'on_way' && `Driver is on the way • ${eta} min`}
                                    {status === 'arrived' && 'Driver has arrived!'}
                                    {status === 'in_progress' && 'Heading to destination'}
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center space-x-4 mb-6">
                                        <img
                                            src={driver.photoUrl}
                                            alt={driver.name}
                                            className="w-16 h-16 rounded-full border-2 border-gray-100"
                                        />
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-bold">{driver.name}</h3>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="text-yellow-500 mr-1">★</span>
                                                {driver.rating} • {driver.carModel}
                                            </div>
                                            <div className="mt-1 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded text-sm font-bold tracking-wider">
                                                {driver.plate}
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                                📞
                                            </button>
                                            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                                💬
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Payment</span>
                                            <span className="font-bold flex items-center">
                                                <span className="mr-2">💳</span> Visa •••• 4242
                                            </span>
                                        </div>
                                    </div>

                                    <button className="mt-6 w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors">
                                        Cancel Ride
                                    </button>
                                </div>
                            </div>
                        )}

                        {status === 'completed' && (
                            <div className="p-8 text-center">
                                {!paymentComplete ? (
                                    <>
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-3xl">💳</span>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Ride Completed</h2>
                                        <p className="text-gray-600 mb-6">Total Fare: <span className="font-bold text-black">$24.50</span></p>

                                        <div className="text-left mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Payment Details</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">Card Number</label>
                                                    <div className="relative">
                                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-black focus:border-black outline-none" />
                                                        <span className="absolute left-3 top-2.5 text-gray-400">💳</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-3">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-bold text-gray-700 mb-1">Expiry</label>
                                                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black outline-none" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-bold text-gray-700 mb-1">CVC</label>
                                                        <input type="text" placeholder="123" className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black outline-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-6 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                id="save-card"
                                                checked={saveCard}
                                                onChange={(e) => setSaveCard(e.target.checked)}
                                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                                            />
                                            <label htmlFor="save-card">Save this card for future rides</label>
                                        </div>

                                        <button
                                            onClick={() => {
                                                // Simulate payment processing
                                                const btn = document.getElementById('pay-btn');
                                                if (btn) {
                                                    btn.innerText = 'Processing...';
                                                    btn.setAttribute('disabled', 'true');
                                                }
                                                setTimeout(() => setPaymentComplete(true), 2000);
                                            }}
                                            id="pay-btn"
                                            className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-lg"
                                        >
                                            Pay $24.50
                                        </button>
                                    </>
                                ) : !ratingSubmitted ? (
                                    <>
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-3xl">✅</span>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                                        <p className="text-gray-600 mb-6">How was your ride with {driver?.name}?</p>

                                        <div className="flex justify-center space-x-2 mb-6">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    className={`text-4xl focus:outline-none transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>

                                        <textarea
                                            placeholder="Leave a comment (optional)"
                                            className="w-full p-4 bg-gray-50 border rounded-xl mb-6 focus:ring-black focus:border-black outline-none resize-none h-24"
                                            id="comment-box"
                                        ></textarea>

                                        <button
                                            onClick={() => {
                                                // Simulate rating submission to backend
                                                console.log('Submitting rating:', {
                                                    rideId: params.tripId,
                                                    stars: rating,
                                                    comment: (document.getElementById('comment-box') as HTMLTextAreaElement)?.value
                                                });
                                                setRatingSubmitted(true);
                                            }}
                                            disabled={rating === 0}
                                            className={`w-full py-3 rounded-xl font-bold mb-4 transition-colors ${rating > 0 ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                        >
                                            Submit Rating
                                        </button>

                                        <button
                                            onClick={() => setRatingSubmitted(true)}
                                            className="text-gray-500 text-sm hover:text-black font-medium"
                                        >
                                            Skip for now
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-3xl">🌟</span>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                                        <p className="text-gray-600 mb-8">Your feedback helps us improve.</p>

                                        <div className="space-y-3">
                                            <button className="w-full bg-gray-100 text-black py-3 rounded-xl font-bold hover:bg-gray-200">
                                                Download Receipt
                                            </button>
                                            <Link href="/" className="block w-full text-center text-gray-500 hover:text-black py-2">
                                                Back to Home
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
}
