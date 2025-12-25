import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import MainLayout from '@/src/components/layout/MainLayout';
import { DashboardCard } from '@/src/components/ui/DashboardCard';
import { FaCar, FaUser, FaChartLine, FaMoneyBillWave, FaQrcode, FaUsers, FaLock, FaSitemap } from 'react-icons/fa';
import { useState } from 'react';
import Link from 'next/link';

// Mock User Data Structure
interface UserData {
  name: string;
  role: 'driver' | 'passenger';
  paid: boolean; // For drivers: false means unpaid, cannot see mlm details
  referralCode: string;
  referralCountL1: number;
  referralCountL2: number;
  walletBalance: string;
  ridesTaken?: number; // Passenger relevant
  ridesDriven?: number; // Driver relevant
}

export const getServerSideProps: GetServerSideProps<{ user: UserData }> = async (context) => {
  // Mock authentication & data fetching
  // In real app, check session/cookie here
  
  // Example: Change 'paid' to false to test unpaid view
  const user: UserData = {
    name: 'Alex Doe',
    role: 'driver', // Change to 'passenger' to test passenger view
    paid: false, // User requested scenario: unpaid drivers can't see tree details
    referralCode: 'ALEXD2024',
    referralCountL1: 12,
    referralCountL2: 45,
    walletBalance: 'KSh 4,500',
    ridesDriven: 142,
  };

  return { props: { user } };
};

export default function DashboardPage({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [showQR, setShowQR] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleUnlockClick = () => {
    setShowPaymentModal(true);
  };

  return (
    <MainLayout title="Dashboard | CABI" description="User dashboard">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user.name}
            </h1>
            <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
              user.role === 'driver' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-blue-600 text-white'
            }`}>
              {user.role === 'driver' ? <FaCar className="mr-2" /> : <FaUser className="mr-2" />}
              {user.role === 'driver' ? 'Driver Partner' : 'Passenger'}
            </div>
             {!user.paid && user.role === 'driver' && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-200">
                  <FaLock className="mr-1" /> Unverified
                </span>
             )}
          </div>

          <div className="flex gap-3">
             <button 
                onClick={() => setShowQR(!showQR)}
                className="flex items-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
             >
                <FaQrcode className="mr-2" /> 
                {showQR ? 'Hide QR' : 'Show QR'}
             </button>
             {user.role === 'passenger' && (
                 <Link href="/" className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                    Book a Ride
                 </Link>
             )}
          </div>
        </div>

        {/* QR Code Section */}
        {showQR && (
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center animate-fadeIn">
                <div className="bg-white p-2 rounded-lg">
                    {/* Placeholder for QR Code */}
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://cabi.com/register?ref=${user.referralCode}`} 
                        alt="My Referral QR" 
                        className="w-48 h-48"
                    />
                </div>
                <p className="mt-4 font-mono text-xl font-bold text-gray-800 dark:text-gray-200 tracking-wider">
                    {user.referralCode}
                </p>
                <p className="text-sm text-gray-500 mt-2">Scan to register with my referral code</p>
            </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
                title={user.role === 'driver' ? "Rides Driven" : "Rides Taken"}
                value={user.role === 'driver' ? user.ridesDriven || 0 : user.ridesTaken || 0}
                icon={<FaCar />}
                color={user.role === 'driver' ? "bg-yellow-400" : "bg-blue-400"}
            />
            <DashboardCard
                title="Wallet Balance"
                value={user.walletBalance}
                icon={<FaMoneyBillWave />}
                color="bg-green-400"
            />
             <DashboardCard
                title="Direct Referrals"
                value={user.referralCountL1}
                icon={<FaUsers />}
                color="bg-purple-400"
            />
             <DashboardCard
                title="Network Size"
                value={user.referralCountL1 + user.referralCountL2}
                icon={<FaSitemap />}
                color="bg-indigo-400"
            />
        </div>

        {/* Referral Tree / MLM Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FaSitemap className="mr-3 text-indigo-500" />
                    My Network (Family Tree)
                </h2>
                {user.role === 'driver' && !user.paid && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded uppercase">Restricted Access</span>
                )}
            </div>
            
            <div className="relative p-6">
                {user.role === 'driver' && !user.paid ? (
                    <div className="text-center py-10 relative">
                        {/* Blurry Background Effect for Content */}
                        <div className="filter blur-sm select-none opacity-50 absolute inset-0 pointer-events-none">
                            <div className="grid grid-cols-3 gap-4 p-4">
                                <div className="h-20 bg-gray-200 rounded"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                            </div>
                        </div>

                        {/* Lock Overlay */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <FaLock className="text-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Network Details Locked</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                You have <strong>{user.referralCountL1}</strong> active prospects in your direct line, but you must complete your registration payment to view details and earn commissions.
                            </p>
                            <button 
                                onClick={handleUnlockClick}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform hover:scale-105"
                            >
                                Unlock My Network
                            </button>
                        </div>
                    </div>
                ) : (
                    // PAID VIEW (or Passenger View)
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {/* Level 1 */}
                             <div className="border border-indigo-100 dark:border-gray-700 rounded-xl p-4 bg-indigo-50 dark:bg-gray-900/50">
                                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-4">Level 1 (Direct)</h3>
                                {user.referralCountL1 > 0 ? (
                                    <ul className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <li key={i} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center mr-3 font-bold text-indigo-700">
                                                        U{i+1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium dark:text-gray-200">User {i+1}</p>
                                                        <p className="text-xs text-gray-500">Active since Dec 2024</p>
                                                    </div>
                                                </div>
                                                <span className="text-green-600 font-bold text-sm">+ KSh 150</span>
                                            </li>
                                        ))}
                                        {user.referralCountL1 > 3 && (
                                            <li className="text-center text-sm text-indigo-600 font-medium pt-2 cursor-pointer">
                                                View all {user.referralCountL1} referrals →
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No direct referrals yet. Share your code!</p>
                                )}
                             </div>

                             {/* Level 2 */}
                             <div className="border border-purple-100 dark:border-gray-700 rounded-xl p-4 bg-purple-50 dark:bg-gray-900/50">
                                <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-4">Level 2 (Indirect)</h3>
                                <p className="text-sm text-gray-600 mb-4">You earn 15% from these referrals.</p>
                                <div className="text-center py-4">
                                    <p className="text-3xl font-bold text-purple-600">{user.referralCountL2}</p>
                                    <p className="text-sm text-gray-500">Drivers in Level 2</p>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Mock Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
               <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
               >
                 ✕
               </button>
               <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Complete Registration</h3>
               <p className="text-gray-600 dark:text-gray-300 mb-6">
                 Please pay your <strong>KSh 1,000</strong> registration fee to unlock your dashboard earnings and view your network details.
               </p>
               <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mb-4">
                 Pay with M-Pesa
               </button>
               <p className="text-xs text-center text-gray-400">Secure payment via Safaricom M-Pesa</p>
           </div>
        </div>
      )}

    </MainLayout>
  );
}
