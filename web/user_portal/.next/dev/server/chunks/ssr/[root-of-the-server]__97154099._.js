module.exports = [
"[project]/apps/user-portal/src/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

```
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import MainLayout from '@/src/components/layout/MainLayout';
import { DashboardCard } from '@/src/components/ui/DashboardCard';
import { FaCar, FaUser, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';

export const getServerSideProps: GetServerSideProps = async () => {
  // Mock stats – replace with real API calls later
  const stats = {
    totalRides: 1245,
    activeDrivers: 87,
    totalEarnings: 'KSh 3,450,000',
    newUsers: 342,
  };
  return { props: { stats } };
};

export default function DashboardPage({ stats }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <MainLayout title="Dashboard | CABI" description="User dashboard with key metrics">
      <Head>
        <title>CABI Dashboard</title>
      </Head>
      <div className="min-h-screen bg-primaryBlack text-yellow-100 p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Rides"
            value={stats.totalRides}
            icon={<FaCar />}
            color="bg-yellow-600"
          />
          <DashboardCard
            title="Active Drivers"
            value={stats.activeDrivers}
            icon={<FaUser />}
            color="bg-yellow-600"
          />
          <DashboardCard
            title="Earnings"
            value={stats.totalEarnings}
            icon={<FaMoneyBillWave />}
            color="bg-yellow-600"
          />
          <DashboardCard
            title="New Users"
            value={stats.newUsers}
            icon={<FaChartLine />}
            color="bg-yellow-600"
          />
        </div>
      </div>
    </MainLayout>
  );
}
```;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__97154099._.js.map