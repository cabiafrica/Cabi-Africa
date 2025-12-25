'use client';

import { useState, useEffect } from 'react';

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initial state matching the mock/requirements
    const [profile, setProfile] = useState({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phoneNumber: '+15550123456'
    });

    useEffect(() => {
        // Mock fetching data
        // In a real app, we would fetch from /api/users/me
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        // Simulate API call
        setTimeout(() => {
            console.log('Updating profile:', profile);
            setIsLoading(false);
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <a href="/dashboard" className="text-sm text-gray-600 hover:text-black">&larr; Back to Dashboard</a>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6">Personal Information</h2>

                    {message && (
                        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    value={profile.firstName}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    value={profile.lastName}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={profile.email}
                                disabled
                                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500 cursor-not-allowed sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed directly.</p>
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                id="phoneNumber"
                                value={profile.phoneNumber}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-200 mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>

                            <div className="flex items-center space-x-6">
                                <div className="shrink-0 relative">
                                    {profileData.profilePictureUrl ? (
                                        <img className="h-20 w-20 object-cover rounded-full" src={profileData.profilePictureUrl} alt="Current profile" />
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <label className="block">
                                        <span className="sr-only">Choose profile photo</span>
                                        <input
                                            type="file"
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-violet-50 file:text-black
                                                hover:file:bg-violet-100"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Simulate upload
                                                    setLoading(true);
                                                    setTimeout(() => {
                                                        const mockUrl = `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=random`;
                                                        setProfileData(prev => ({ ...prev, profilePictureUrl: mockUrl }));
                                                        setLoading(false);
                                                        setSuccessMessage('Profile picture updated!');
                                                        setTimeout(() => setSuccessMessage(null), 3000);
                                                    }, 1500);
                                                }
                                            }}
                                        />
                                    </label>

                                    {profileData.profilePictureUrl && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLoading(true);
                                                setTimeout(() => {
                                                    setProfileData(prev => ({ ...prev, profilePictureUrl: null }));
                                                    setLoading(false);
                                                    setSuccessMessage('Profile picture removed.');
                                                    setTimeout(() => setSuccessMessage(null), 3000);
                                                }, 1000);
                                            }}
                                            className="text-sm text-red-600 hover:text-red-500 font-medium text-left"
                                        >
                                            Remove photo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 mt-6">
                            <h3 className="text-lg font-medium text-gray-900">Security & Privacy</h3>
                            <div className="mt-4 space-y-3">
                                <div>
                                    <a href="/account/security" className="text-yellow-600 hover:text-yellow-500 font-medium text-sm">
                                        Change Password &rarr;
                                    </a>
                                </div>
                                <div>
                                    <a href="/account/privacy" className="text-yellow-600 hover:text-yellow-500 font-medium text-sm">
                                        Privacy Center & Communication Preferences &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="button"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 mr-3"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
