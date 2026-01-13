import Link from 'next/link';

export default function RegisterCTAWidget() {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 shadow-md text-white mb-6">
            <h3 className="font-bold text-lg mb-2">Join Cabi Africa Today</h3>
            <p className="text-gray-400 text-sm mb-4">Experience the future of mobility. Earn more as a driver or ride smarter as a passenger.</p>

            <div className="mt-4">
                <Link
                    href="/register"
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-500/30"
                >
                    Register Now
                </Link>
            </div>
        </div>
    );
}
