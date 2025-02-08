'use client';

import React from 'react';
import Link from 'next/link';
import { Alert, Card, Divider, FormControl, InputLabel, MenuItem, Select, Snackbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import api from '@/lib/api';
import { useDepartemen } from '@/lib/departemen/departemen';
import { usePenyewaan } from '@/lib/pemrosesan/penyewaan';
import { usePenyewaanFilter } from '@/contexts/PenyewaanContext';
import { useUsers } from '@/hooks/use-user';

const TableHeader: React.FC = () => {
  const {
    departemenFilter,
    setDepartemenFilter,
    statusPengajuanFilter,
    setStatusPengajuanFilter,
    statusAsetFilter,
    setStatusAsetFilter,
    searchQuery,
    setSearchQuery,
  } = usePenyewaanFilter();

  const { departemen } = useDepartemen();
  const { penyewaan } = usePenyewaan();
  const { user } = useUsers();
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const getUniqueStatusValues = (key: 'statusPengajuan' | 'statusAset') => {
    return ['All', ...Array.from(new Set(penyewaan.map((item: any) => item[key])))];
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleDepartemenChange = (e: any) => {
    setDepartemenFilter(e.target.value);
    // Reset related filters when department changes
    if (e.target.value === 'All') {
      setStatusPengajuanFilter('All');
      setStatusAsetFilter('All');
    }
  };

  const handleStatusPengajuanChange = (e: any) => {
    setStatusPengajuanFilter(e.target.value);
    if (e.target.value === 'All') {
      setStatusAsetFilter('All');
      setDepartemenFilter('All');
    }
  };

  const handleStatusAsetChange = (e: any) => {
    setStatusAsetFilter(e.target.value);
    if (e.target.value === 'All') {
      setStatusPengajuanFilter('All');
      setDepartemenFilter('All');
    }
  };

  const restrictedRoles = ['DEKAN', 'KADEP', 'WD2'];
  const restrictedRoles2 = ['USER', 'MAHASISWA'];

  const handleExport = async () => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/penyewaan/export/excel`, {
        responseType: 'blob', // Specify that we expect a Blob response
      });
      if (!response.data) {
        throw new Error('Failed to export data');
      }
      const url = window.URL.createObjectURL(response.data); // Use response.data directly
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'penyewaan_data.xlsx'); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSnackbarMessage('Data penyewaan berhasil diexport');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSnackbarMessage('Tidak terdapat data penyewaan yang dapat diexport');
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
              Data Penyewaan
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {user?.role && !restrictedRoles.includes(user.role) ? (
                <Link href="/penyewaan/penyewaan-create" style={{ width: '100%' }}>
                  <Button
                    id="penyewaan"
                    variant="contained"
                    fullWidth
                    aria-label="penyewaan"
                    sx={{
                      padding: '12px 16px',
                      minWidth: '120px',
                    }}
                  >
                    Penyewaan
                  </Button>
                </Link>
              ) : null}
              {user?.role && !restrictedRoles2.includes(user.role) ? (
                <Button
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
                </Button>
              ) : null}
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
            <FormControl sx={{ width: { xs: '100%', md: 150 } }}>
              <InputLabel id="departemen-filter-label">Departemen</InputLabel>
              <Select
                labelId="departemen-filter-label"
                value={departemenFilter}
                label="Departemen"
                onChange={handleDepartemenChange}
                size="small"
              >
                <MenuItem value="All">All</MenuItem>
                {departemen.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.nama}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', md: 200 } }}>
              <InputLabel id="status-pengajuan-filter-label">Status Pengajuan</InputLabel>
              <Select
                labelId="status-pengajuan-filter-label"
                value={statusPengajuanFilter}
                onChange={handleStatusPengajuanChange}
                size="small"
                label="Status Pengajuan"
              >
                {getUniqueStatusValues('statusPengajuan').map((status) => (
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
                onChange={handleStatusAsetChange}
                size="small"
                label="Status Aset"
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
                width: { xs: '100%', md: 150 },
              }}
              placeholder="Cari..."
            />
          </Box>
        </Box>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {
            setSnackbarOpen(false);
          }}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TableHeader;
