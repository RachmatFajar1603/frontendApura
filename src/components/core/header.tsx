import { Box, Stack, Typography } from '@mui/material';

interface Header {
  title: string;
  sx?: object;
}

const Header: React.FC<Header> = ({ title }) => {
  return (
      <Typography
        variant="h4"
        sx={{
          width: 'fit-content',
        }}
      >
        {title}
      </Typography>
  );
};

export default Header;
