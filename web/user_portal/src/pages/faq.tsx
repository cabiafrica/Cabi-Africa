'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Accordion from '../components/ui/Accordion';
import MainLayout from '@/src/components/layout/MainLayout';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Getting Started (Drivers)
  {
    category: 'Getting Started',
    q: 'How do I become a Cabi driver?',
    a: 'To become a Cabi driver, fill out our online registration form with your personal details and referral code (if you have one). After registration, download the Cabi Driver app to complete your profile, upload required documents (driver\'s license, vehicle registration, insurance), and wait for approval. The process typically takes 2-3 business days.',
  },
  {
    category: 'Getting Started',
    q: 'What are the requirements to drive for Cabi?',
    a: 'You must be at least 21 years old, have a valid driver\'s license, own or have access to a registered vehicle (2010 or newer), have valid vehicle insurance, pass a background check, and have a clean driving record. Some cities may have additional requirements.',
  },
  {
    category: 'Getting Started',
    q: 'Is there a registration fee?',
    a: 'Yes, there is a one-time registration fee of $50. This fee covers background checks, onboarding materials, and administrative costs. The fee is non-refundable but can be offset by referral commissions if you recruit other drivers.',
  },
  {
    category: 'Getting Started',
    q: 'How long does the approval process take?',
    a: 'Most applications are reviewed within 2-3 business days. You\'ll receive email notifications at each stage: application received, documents under review, background check in progress, and final approval.',
  },

  // Earnings & Payments
  {
    category: 'Earnings & Payments',
    q: 'How much can I earn as a Cabi driver?',
    a: 'Earnings vary based on location, hours worked, and demand. On average, Cabi drivers earn $15-$25 per hour after expenses. Peak hours (morning/evening rush, weekends, events) typically offer higher earnings due to surge pricing. You can also earn additional income through our MLM referral program.',
  },
  {
    category: 'Earnings & Payments',
    q: 'When and how do I get paid?',
    a: 'Cabi offers weekly automatic payouts every Monday for the previous week\'s earnings (Monday-Sunday). Payments are deposited directly to your bank account via ACH transfer. You can also request instant payouts for a small fee ($0.50) if you need immediate access to your earnings.',
  },
  {
    category: 'Earnings & Payments',
    q: 'What is the MLM referral program?',
    a: 'Our Multi-Level Marketing (MLM) program rewards you for recruiting new drivers. When someone registers using your referral code and pays the registration fee, you earn a commission. You also earn from drivers recruited by your referrals (up to 3 levels deep). Default commission: 30% for direct referrals, 15% for level 2, and 5% for level 3.',
  },
  {
    category: 'Earnings & Payments',
    q: 'How do I track my earnings?',
    a: 'The Cabi Driver app provides a detailed earnings dashboard showing daily, weekly, and monthly totals. You can view earnings by trip, see breakdowns of base fare, surge pricing, tips, and bonuses, and download statements for tax purposes.',
  },

  // Referral Program
  {
    category: 'Referral Program',
    q: 'How do I get my referral code?',
    a: 'Your unique referral code is generated automatically when you complete registration. You can find it in the Cabi Driver app under "Referrals" or "My Network". Share this code with prospective drivers to earn commissions.',
  },
  {
    category: 'Referral Program',
    q: 'How much do I earn from referrals?',
    a: 'You earn 30% of the $50 registration fee ($15) for each driver who registers with your code. You also earn 15% ($7.50) from drivers they recruit, and 5% ($2.50) from the next level. Commissions are paid within 24 hours of the new driver\'s registration payment.',
  },
  {
    category: 'Referral Program',
    q: 'Is there a limit to how many drivers I can refer?',
    a: 'No! There is no limit to the number of drivers you can refer. The more drivers you recruit, the more you earn. Some of our top recruiters have built networks of 100+ drivers and earn significant passive income from referral commissions.',
  },
  {
    category: 'Referral Program',
    q: 'Can I see who I\'ve referred?',
    a: 'Yes, the Cabi Driver app has a "My Network" section where you can view all drivers in your downline (direct referrals and their referrals), see their status (prospect, active, inactive), and track your commission earnings from each level.',
  },

  // Driving & Operations
  {
    category: 'Driving & Operations',
    q: 'Can I choose when to drive?',
    a: 'Absolutely! Cabi offers complete flexibility. You can drive whenever you want—full-time, part-time, or just a few hours a week. There are no minimum hour requirements. Simply go online in the app when you\'re ready to accept rides.',
  },
  {
    category: 'Driving & Operations',
    q: 'What areas can I drive in?',
    a: 'You can drive in any city where Cabi operates. Currently, we\'re available in major cities across Kenya. Check the app for the full list of active cities. You can also drive in multiple cities if you travel.',
  },
  {
    category: 'Driving & Operations',
    q: 'How do I accept ride requests?',
    a: 'When you\'re online in the Cabi Driver app, you\'ll receive ride requests based on your location. Each request shows the passenger\'s pickup location, destination, estimated fare, and distance. You have 15 seconds to accept or decline.',
  },
  {
    category: 'Driving & Operations',
    q: 'What if I need to cancel a ride?',
    a: 'You can cancel a ride before pickup without penalty if there\'s a valid reason (passenger not responding, unsafe situation, etc.). However, frequent cancellations may affect your driver score and acceptance rate. Always communicate with the passenger before canceling.',
  },

  // Vehicle & Insurance
  {
    category: 'Vehicle & Insurance',
    q: 'What type of vehicle do I need?',
    a: 'Your vehicle must be a 4-door sedan, SUV, or van, model year 2010 or newer, in good condition (no cosmetic damage), and pass a vehicle inspection. The vehicle must be registered in your name or you must have written permission from the owner.',
  },
  {
    category: 'Vehicle & Insurance',
    q: 'Do I need special insurance?',
    a: 'Yes, you need commercial rideshare insurance or a personal policy with rideshare coverage. Cabi also provides supplemental insurance that covers you during active trips. You must upload proof of insurance during the registration process.',
  },
  {
    category: 'Vehicle & Insurance',
    q: 'Can I use a rental car?',
    a: 'Yes, you can use a rental car as long as you have written permission from the rental company to use it for ridesharing. Some rental companies partner with Cabi to offer special rates for drivers.',
  },

  // Safety & Support
  {
    category: 'Safety & Support',
    q: 'How does Cabi ensure my safety?',
    a: 'Cabi prioritizes driver safety with features like real-time GPS tracking, in-app emergency button (SOS), 24/7 safety support line, passenger ratings and reviews, and the ability to share trip details with trusted contacts.',
  },
  {
    category: 'Safety & Support',
    q: 'What if I have an issue with a passenger?',
    a: 'If you experience any issues with a passenger (inappropriate behavior, safety concerns, etc.), you can report them through the app immediately. Our support team reviews all reports within 24 hours and takes appropriate action.',
  },
  {
    category: 'Safety & Support',
    q: 'How do I contact Cabi support?',
    a: 'You can contact Cabi support 24/7 through the in-app chat, email (support@cabi.com), or phone hotline. For urgent safety issues, use the in-app SOS button for immediate assistance.',
  },

  // Passengers
  {
    category: 'For Passengers',
    q: 'How do I book a ride?',
    a: 'Download the Cabi Passenger app, enter your destination, confirm your pickup location, and a nearby driver will be on their way. You can track your driver in real-time.',
  },
  {
    category: 'For Passengers',
    q: 'What payment methods are accepted?',
    a: 'We accept major credit cards, debit cards, and mobile money payments directly through the app for a seamless and cashless experience.',
  },
  {
    category: 'For Passengers',
    q: 'Can I schedule a ride in advance?',
    a: 'Yes! You can schedule rides up to 30 days in advance. Simply select "Schedule" when booking and choose your preferred date and time.',
  },

  // Billing
  {
    category: 'Billing & Payments',
    q: 'I have an issue with a charge. What should I do?',
    a: 'Please open a support ticket through the app under the "Billing" or "Payment Dispute" category. Our support team will investigate the issue and respond within 24-48 hours.',
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  // Filter FAQs based on search and category
  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category for display
  const groupedFAQs = filteredFAQs.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <MainLayout
      title="Frequently Asked Questions | Cabi"
      description="Find answers to common questions about becoming a Cabi driver, earnings, referrals, and more."
    >
      <div className="bg-white dark:bg-slate-900 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-center text-blue-100 mb-8">
              Everything you need to know about Cabi
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="bg-gray-50 dark:bg-gray-800 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No questions found matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            ) : (
              Object.entries(groupedFAQs).map(([category, items]) => (
                <section key={category} className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{category}</h2>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {items.map((item, index) => (
                      <Accordion key={index} title={item.q}>{item.a}</Accordion>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Our support team is here to help 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@cabi.com"
                className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Email Support
              </a>
              <Link
                href="/drivers/register"
                className="bg-blue-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-900 transition-colors border-2 border-white"
              >
                Start Driving Today
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}