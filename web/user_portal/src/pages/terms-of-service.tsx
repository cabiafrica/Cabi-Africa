import MainLayout from '@/components/layout/MainLayout';

export default function TermsOfServicePage() {
  return (
    <MainLayout
      title="Terms of Service | CABI"
      description="Read the CABI Terms of Service to understand the rules for using our platform."
    >
      <div className="bg-slate-50 dark:bg-surface-dark py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 p-8 sm:p-10 rounded-3xl shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-black mb-4 text-slate-900 dark:text-white">
            Terms of <span className="text-[#D4AF37]">Service</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                1. User Accounts
              </h2>
              <p>
                [Placeholder] To use most aspects of the CABI platform, you must register for and maintain an active personal user account. You must be at least 18 years of age to obtain an account. Account registration requires you to submit certain personal information, such as your name, address, mobile phone number, and age, as well as at least one valid payment method.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                2. User Conduct
              </h2>
              <p>
                [Placeholder] You agree to comply with all applicable laws when using the services and you may only use the services for lawful purposes. You will not, in your use of the services, cause nuisance, annoyance, inconvenience, or property damage, whether to the third-party provider or any other party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                3. Disclaimers
              </h2>
              <p>
                [Placeholder] The services are provided "as is" and "as available." CABI disclaims all representations and warranties, express, implied, or statutory, not expressly set out in these terms, including the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                4. Limitation of Liability
              </h2>
              <p>
                [Placeholder] CABI shall not be liable for indirect, incidental, special, exemplary, punitive, or consequential damages, including lost profits, lost data, personal injury, or property damage related to, in connection with, or otherwise resulting from any use of the services.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}