import React from 'react';
import {
  Box,
  Card,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

interface TableHeaderProps {
  typeFilter: 'All' | 'Peminjaman' | 'Penyewaan' | 'Perbaikan';
  setTypeFilter: (value: 'All' | 'Peminjaman' | 'Penyewaan' | 'Perbaikan') => void;
  statusPengajuanFilter: string;
  setStatusPengajuanFilter: (value: string) => void;
  statusAsetFilter: string;
  setStatusAsetFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  getUniqueStatusValues: (key: 'statusPengajuan' | 'statusAset') => string[];
}

const TableHeader: React.FC<TableHeaderProps> = ({
  typeFilter,
  setTypeFilter,
  statusPengajuanFilter,
  setStatusPengajuanFilter,
  statusAsetFilter,
  setStatusAsetFilter,
  searchQuery,
  setSearchQuery,
  getUniqueStatusValues,
}) => {
  return (
    <Card>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'start', md: 'center' },
              gap: { xs: 2, md: 0 },
              width: '100%',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                mb: { xs: 2, md: 0 },
              }}
            >
              Riwayat Peminjaman, Penyewaan, dan Perbaikan
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'var(--mui-palette-neutral-300)', width: '100%', margin: '0 auto' }} />
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              width: '100%',
            }}
          >
            <FormControl sx={{ width: { xs: '100%', md: 250 } }}>
              <InputLabel id="tipe-filter-label">Tipe</InputLabel>
              <Select
                labelId="tipe-filter-label"
                value={typeFilter}
                label="Tipe"
                onChange={(e) => { setTypeFilter(e.target.value as 'All' | 'Peminjaman' | 'Penyewaan' | 'Perbaikan'); }}
                size="small"
              >
                <MenuItem value="All">Semua</MenuItem>
                <MenuItem value="Peminjaman">Peminjaman</MenuItem>
                <MenuItem value="Penyewaan">Penyewaan</MenuItem>
                <MenuItem value="Perbaikan">Perbaikan</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', md: 250 } }}>
              <InputLabel id="status-pengajuan-filter-label">Status Pengajuan</InputLabel>
              <Select
                labelId="status-pengajuan-filter-label"
                value={statusPengajuanFilter}
                label="Status Pengajuan"
                onChange={(e) => { setStatusPengajuanFilter(e.target.value); }}
                size="small"
              >
                {getUniqueStatusValues('statusPengajuan').map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', md: 250 } }}>
              <InputLabel id="status-aset-filter-label">Status Aset</InputLabel>
              <Select
                labelId="status-aset-filter-label"
                value={statusAsetFilter}
                label="Status Aset"
                onChange={(e) => { setStatusAsetFilter(e.target.value); }}
                size="small"
              >
                {getUniqueStatusValues('statusAset').map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              id="search-query"
              label="Cari"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); }}
              size="small"
              sx={{
                width: { xs: '100%', md: 250 },
              }}
              placeholder="Cari berdasarkan nama peminjam..."
            />
          </Box>
        </Box>
      </Card>
  );
};

export default TableHeader;
