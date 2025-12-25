import MainLayout from '../components/layout/MainLayout';

export default function ReferralProgram() {
    return (
        <MainLayout title="Referral Program - Earn More with Cabi" description="Invite friends to drive or ride with Cabi and earn rewards.">
            <div className="bg-white dark:bg-slate-900 py-16 px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">Refer & Earn</h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Our referral program is coming soon! You'll be able to earn bonuses for every driver or passenger you introduce to Cabi.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
