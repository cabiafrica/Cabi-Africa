import Head from 'next/head';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | CABI</title>
        <meta
          name="description"
          content="Read the CABI Privacy Policy to understand how we handle your data."
        />
      </Head>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                1. Information We Collect
              </h2>
              <p>
                [Placeholder] We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                2. How We Use Your Information
              </h2>
              <p>
                [Placeholder] We may use the information we collect about you to: provide, maintain, and improve our services; process transactions and send related information; send you communications we think will be of interest to you; and personalize and improve the services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                3. Data Sharing
              </h2>
              <p>
                [Placeholder] We may share the information we collect about you as described in this Privacy Policy or as described at the time of collection or sharing, including with other users to enable them to provide the services you request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                4. Data Security
              </h2>
              <p>
                [Placeholder] We are committed to protecting the data of the CABI community. We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                5. Your Rights
              </h2>
              <p>
                [Placeholder] You have the right to access, correct, or delete your personal information. You may also have the right to object to or restrict certain types of processing of your personal information.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}