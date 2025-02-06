import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

interface PeminjamanStatusChartProps {
  peminjamanStats: Record<string, number>;
  penyewaanStats: Record<string, number>;
}

const PeminjamanStatusChart: React.FC<PeminjamanStatusChartProps> = ({ peminjamanStats, penyewaanStats }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={['DISETUJUI', 'DITOLAK', 'PENDING'].map((status) => ({
          name: status,
          Peminjaman: peminjamanStats[status] || 0,
          Penyewaan: penyewaanStats[status] || 0,
        }))}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Peminjaman" fill="#8884d8" />
        <Bar dataKey="Penyewaan" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PeminjamanStatusChart;