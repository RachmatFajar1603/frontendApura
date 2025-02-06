import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box
      sx={{
        p: 1,
        textAlign: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: '#A6AEBF',
        }}
      >
        © 2025 APURA USK. All rights reserved.
      </Typography>
    </Box>
  );
}

export default Footer;
