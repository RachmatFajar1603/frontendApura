import { Card, CardContent, Typography } from '@mui/material';

interface SummaryCardProps {
  title: string;
  value: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="overline">{title}</Typography>
        <Typography variant="h4">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
