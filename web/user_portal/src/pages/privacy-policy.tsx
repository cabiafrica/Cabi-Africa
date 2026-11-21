import MainLayout from '@/components/layout/MainLayout';

export default function PrivacyPolicyPage() {
  return (
    <MainLayout
      title="Privacy Policy | Cabi Fast Africa"
      description="Learn how Cabi Fast Africa Limited collects, uses, and safeguards your personal data in compliance with the Kenya Data Protection Act, 2019."
    >
      <div className="bg-slate-50 dark:bg-surface-dark py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 p-8 sm:p-10 rounded-3xl shadow-xl">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
            <span className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              Kenya Data Protection Act, 2019 Compliant
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900 dark:text-white">
              Cabi Fast Africa <span className="text-[#D4AF37]">Privacy Policy</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            <section>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                1. Introduction
              </h2>
              <p>
                Cabi Fast Africa Limited (&quot;Cabi Fast Africa&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and protect your personal data across our Passenger Mobile App, Driver Mobile App, web portals, and ride-hailing services. 
                We comply with the <strong>Kenya Data Protection Act, 2019</strong> and regulations issued by the <strong>Office of the Data Protection Commissioner (ODPC)</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                2. Information We Collect
              </h2>
              <p className="mb-3">We collect data necessary to provide reliable, safe, and legal transportation services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity &amp; Contact:</strong> Full name, telephone number, email address, national ID number, and profile photo.</li>
                <li><strong>Driver Credentialing:</strong> Driver&apos;s license, NTSA PSV badge, vehicle logbook, inspection certificate, comprehensive insurance, and certificate of good conduct.</li>
                <li><strong>Real-time Telematics &amp; Location:</strong> High-precision GPS coordinates during trip request, active route transit, and SOS emergency broadcast.</li>
                <li><strong>Financial &amp; Transactional Data:</strong> M-Pesa phone numbers, mobile transaction identifiers, Fare receipts, SACCO contribution allocations, and driver payouts.</li>
                <li><strong>Safety &amp; Biometric Records:</strong> In-app selfie biometric verification snapshots and trip audio/chat records initiated for occurrence reporting.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                3. Purpose and Legal Basis of Processing
              </h2>
              <p className="mb-3">We process your personal information under lawful grounds provided by Section 30 of the Kenya Data Protection Act:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Delivery:</strong> To match riders with nearby drivers, navigate routes, and process payments across cash, mobile money, wallet, or prepaid channels.</li>
                <li><strong>Safety &amp; Incident Investigation:</strong> To verify driver eligibility, run Occurrence Book investigations, and trigger SOS alerts.</li>
                <li><strong>Regulatory Obligations:</strong> To adhere to NTSA ride-hailing regulations, Traffic Act guidelines, and KRA tax accounting rules.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                4. Data Sharing &amp; Hosting
              </h2>
              <p className="mb-3">We never sell your personal data. Data is only shared as required for service fulfillment:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Drivers and Passengers:</strong> Sharing necessary trip coordination information (first name, vehicle details, live pickup location).</li>
                <li><strong>Secure Cloud Infrastructure:</strong> Hosted on certified cloud infrastructure with strict security controls meeting Kenyan cross-border transfer standards.</li>
                <li><strong>Legal Authorities:</strong> Only when strictly required by a valid court order, lawful police investigation, or immediate threat to human life.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                5. Your Statutory Privacy Rights
              </h2>
              <p className="mb-3">Under the Kenya Data Protection Act, 2019, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a digital copy of all personal records and ride histories held by Cabi Fast Africa.</li>
                <li><strong>Rectification:</strong> Edit and update your personal details, phone number, and vehicle information.</li>
                <li><strong>Erasure:</strong> Request permanent deletion of your account and personal identifiers from our production systems.</li>
                <li><strong>Object:</strong> Opt out of marketing notifications and non-essential promotional communications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                6. Contact Our Data Protection Officer (DPO)
              </h2>
              <p>
                To exercise your rights or make privacy inquiries, please contact our acting Data Protection Officer:
              </p>
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border border-slate-200 dark:border-white/10">
                <p><strong>Entity:</strong> Cabi Fast Africa Limited</p>
                <p><strong>Officer:</strong> Company Director (Acting Data Protection Officer)</p>
                <p><strong>Email:</strong> privacy@cabi.africa / cabifastafrica@gmail.com</p>
                <p><strong>Location:</strong> Nairobi, Kenya</p>
                <p className="mt-2 text-xs text-gray-500">
                  You also have the right to lodge a formal complaint with the Office of the Data Protection Commissioner (ODPC) at <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">www.odpc.go.ke</a>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
