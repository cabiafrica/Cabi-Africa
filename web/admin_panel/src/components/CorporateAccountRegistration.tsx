import React, { useState } from 'react';

export const CorporateAccountRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Call
    setTimeout(() => {
      console.log('Registering Corporate Account:', formData);
      setIsSubmitting(false);
      alert(`Corporate account for ${formData.companyName} created successfully! Welcome email sent to ${formData.contactEmail}.`);
      setFormData({
        companyName: '',
        taxId: '',
        address: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      });
    }, 1500);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Register Corporate Account</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input required name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax ID (KRA PIN)</label>
            <input required name="taxId" value={formData.taxId} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Billing Address</label>
          <input required name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Primary Contact Person</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input required name="contactName" value={formData.contactName} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input required name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Corporate Account'}
          </button>
        </div>
      </form>
    </div>
  );
};