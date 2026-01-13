'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/forms/CheckoutForm';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentComponent() {
  const [clientSecret, setClientSecret] = useState('');
  const searchParams = useSearchParams();
  // In a real app, the user ID would come from a secure session after registration.
  // For this flow, we assume the registration page redirects here with the userId.
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (!userId) return;

    // Create PaymentIntent as soon as the page loads
    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [userId]);

  const appearance = { theme: 'stripe' };
  const options = { clientSecret, appearance };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-3xl font-bold">Complete Your Registration</h1>
        {clientSecret && (
          <Elements options={options as any} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        )}
      </div>
    </main>
  );
}

export default function PayPage() {
  return <Suspense><PaymentComponent /></Suspense>;
}