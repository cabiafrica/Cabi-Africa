import React from 'react';

export default function FAQPage() {
    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg">How do I sign up?</h3>
                    <p className="text-gray-700">Click the "Sign Up" button on the homepage and follow the instructions.</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg">What are the requirements?</h3>
                    <p className="text-gray-700">You need a valid driver's license, vehicle registration, and insurance.</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg">When do I get paid?</h3>
                    <p className="text-gray-700">Payments are processed weekly directly to your bank account.</p>
                </div>
            </div>
        </div>
    );
}
