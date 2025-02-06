import { type Metadata } from 'next';

import { config } from '@/config';
import DashboardPage from '@/components/dashboard/DashboardPage';

export const metadata = {
  title: `Dashboard | ${config.site.name}`,
  description: 'Dashboard merupakan halaman yang menampilkan data dalam betuk grafik.',
} satisfies Metadata;
function Dashboard() {
  return <DashboardPage />;
}
export default Dashboard;
