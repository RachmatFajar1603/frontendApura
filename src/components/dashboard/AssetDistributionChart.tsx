import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface AssetDistributionChartProps {
  assetStats: { name: string; value: number }[];
}

const AssetDistributionChart: React.FC<AssetDistributionChartProps> = ({ assetStats }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={assetStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {assetStats.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AssetDistributionChart;