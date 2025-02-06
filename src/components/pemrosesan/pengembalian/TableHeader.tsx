'use client';

import React from 'react';
import Link from 'next/link';
import { Alert, Card, Divider, InputLabel, MenuItem, Select, Snackbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import api from '@/lib/api';
import { usePengembalian } from '@/lib/pemrosesan/pengembalian';
import { usePengembalianFilter } from '@/contexts/PengembalianContext';
import { useUsers } from '@/hooks/use-user';
import Header from '@/components/core/header';

function TableHeader() {
  const {
    statusPengembalianFilter,
    setStatusPengembalianFilter,
    statusAsetFilter,
    setStatusAsetFilter,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
  } = usePengembalianFilter();

  const { pengembalian } = usePengembalian();
  const { user } = useUsers();
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const getUniqueStatusValues = (key: 'statusPengembalian' | 'statusAset' | 'typePemrosesan') => {
    return ['All', ...Array.from(new Set(pengembalian.map((item: any) => item[key])))];
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value); // Akan menggunakan handler yang sudah dimodifikasi dari context
  };

  const restrictedRoles = ['DEKAN', 'KADEP', 'WD2'];
  const restrictedRoles2 = ['USER', 'MAHASISWA'];

  const handleExport = async () => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/pengembalian/export/excel`, {
        responseType: 'blob', // Specify that we expect a Blob response
      });
      if (!response.data) {
        throw new Error('Failed to export data');
      }
      const url = window.URL.createObjectURL(response.data); // Use response.data directly
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pengembalian_data.xlsx'); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSnackbarMessage('Data pengembalian berhasil diexport');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSnackbarMessage('Tidak terdapat data pengembalian yang dapat diexport');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
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
              Data Pengembalian
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {user?.role && !restrictedRoles.includes(user.role) ? <Link href="/pengembalian/pengembalian-create" style={{ width: '100%' }}>
                  <Button
                    id="pengembalian"
                    variant="contained"
                    fullWidth
                    aria-label="pengembalian"
                    sx={{
                      bgcolor: '#9a221a',
                      '&:hover': { bgcolor: '#f04438' },
                      padding: '12px 16px',
                      minWidth: '120px',
                    }}
                  >
                    Pengembalian
                  </Button>
                </Link> : null}
              {user?.role && !restrictedRoles2.includes(user.role) ? <Button
                  id="export"
                  variant="outlined"
                  fullWidth
                  aria-label="Export"
                  endIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
                  onClick={handleExport}
                  sx={{
                    color: '#006400',
                    borderColor: '#006400',
                    '&:hover': {
                      bgcolor: '#004220',
                      color: 'white',
                      borderColor: '#004220',
                    },
                  }}
                >
                  Export
                </Button> : null}
            </Stack>
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
            <FormControl sx={{ width: { xs: '100%', md: 200 } }}>
              <InputLabel id="tipe-filter-label">Tipe</InputLabel>
              <Select
                labelId="tipe-filter-label"
                value={typeFilter}
                label="Tipe"
                onChange={(e) => { setTypeFilter(e.target.value as 'All' | 'Peminjaman' | 'Penyewaan'); }}
                size="small"
              >
                <MenuItem key="all" value="All">
                  Semua
                </MenuItem>
                <MenuItem key="peminjaman" value="Peminjaman">
                  Peminjaman
                </MenuItem>
                <MenuItem key="penyewaan" value="Penyewaan">
                  Penyewaan
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', md: 200 } }}>
              <InputLabel id="status-pengembalian-filter-label">Status Pengembalian</InputLabel>
              <Select
                labelId="status-pengembalian-filter-label"
                value={statusPengembalianFilter}
                label="Status Pengembalian"
                onChange={(e) => { setStatusPengembalianFilter(e.target.value); }}
                size="small"
              >
                {getUniqueStatusValues('statusPengembalian').map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', md: 200 } }}>
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
              onChange={handleSearchChange}
              size="small"
              sx={{
                width: { xs: '100%', md: 200 },
              }}
              placeholder="Cari berdasarkan nama peminjam..."
            />
          </Box>
        </Box>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => { setSnackbarOpen(false); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => { setSnackbarOpen(false); }} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default TableHeader;
