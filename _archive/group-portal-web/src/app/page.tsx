'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GroupPortalLanding() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        founderId: 'user_1', // Mocked for now
        certificateUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Call backend to create organization
        console.log('Registering organization:', formData);

        // Mock success
        alert('Registration submitted! Please wait for admin verification.');
        // In a real flow, redirect to a "submission pending" status page or dashboard
        // For partial MVP, we might redirect to a mock dashboard
        const mockOrgId = 'org_' + Date.now();
        router.push(`/dashboard/${mockOrgId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Register Your Driver Organization
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Create a formal group, union, or association on the Cabi platform.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                                Organization Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="orgName"
                                    name="orgName"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="certificateUrl" className="block text-sm font-medium text-gray-700">
                                Government Registration Certificate URL
                            </label>
                            <div className="mt-1">
                                <input
                                    id="certificateUrl"
                                    name="certificateUrl"
                                    type="url"
                                    required
                                    placeholder="https://..."
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.certificateUrl}
                                    onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Link to your official registration document (PDF/Image).
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Register Organization
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
