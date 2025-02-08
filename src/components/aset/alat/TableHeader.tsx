'use client';

import React from 'react';
import { Alert, Card, Divider, FormControl, InputLabel, MenuItem, Select, Snackbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import api from '@/lib/api';
import { useAlatManage } from '@/lib/aset/alat/UseAlatManage';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useGedung } from '@/lib/gedung/gedung';
import { useAlatFilter } from '@/contexts/AlatContext';
import { usePopover } from '@/hooks/use-popover';
import { useUsers } from '@/hooks/use-user';

import Modal from './modal';

function TableHeader() {
  const {
    departemenFilter,
    setDepartemenFilter,
    gedungFilter,
    setGedungFilter,
    lantaiFilter,
    setLantaiFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useAlatFilter();
  const { alatManage } = useAlatManage();
  const { open, handleOpen, handleClose } = usePopover();
  const { departemen } = useDepartemen();
  const { gedung } = useGedung();
  const { user } = useUsers();
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const getUniqueStatusValues = () => {
    const statusValues = Array.from(new Set(alatManage.map((item) => item.statusAset)));
    return ['All', ...statusValues.sort()];
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleDepartemenChange = (e: any) => {
    setDepartemenFilter(e.target.value);
    // Reset related filters when department changes
    if (e.target.value === 'All') {
      setGedungFilter('All');
      setLantaiFilter('All');
    }
  };

  const handleGedungChange = (e: any) => {
    setGedungFilter(e.target.value);
    // Reset lantai when gedung changes
    if (e.target.value === 'All') {
      setLantaiFilter('All');
    }
  };

  const restrictedRoles = ['DEKAN', 'WD2', 'KADEP'];

  const handleExport = async () => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/alat/export/excel`, {
        responseType: 'blob',
      });
      if (!response.data) {
        throw new Error('Failed to export data');
      }
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'alat_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSnackbarMessage('Data aset alat berhasil diexport');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSnackbarMessage('Tidak terdapat data aset alat yang dapat diexport');
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
              Data Aset Alat
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {user?.role && !restrictedRoles.includes(user.role) ? (
                <Button
                  id="tambah"
                  variant="contained"
                  fullWidth
                  aria-label="tambah"
                  sx={{
                    padding: '12px 16px',
                    minWidth: '120px',
                  }}
                  onClick={handleOpen}
                >
                  Tambah
                </Button>
              ) : null}
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
                  minWidth: '120px',
                  '&:hover': {
                    bgcolor: '#004220',
                    color: 'white',
                    borderColor: '#004220',
                  },
                }}
              >
                Export
              </Button>
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

            <FormControl sx={{ width: { xs: '100%', md: 150 } }}>
              <InputLabel id="gedung-filter-label">Gedung</InputLabel>
              <Select
                labelId="gedung-filter-label"
                value={gedungFilter}
                label="Gedung"
                onChange={handleGedungChange}
                size="small"
              >
                <MenuItem value="All">All</MenuItem>
                {gedung.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.nama}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', md: 150 } }}>
              <InputLabel id="lantai-filter-label">Lantai</InputLabel>
              <Select
                labelId="lantai-filter-label"
                value={lantaiFilter}
                label="Lantai"
                onChange={(e) => {
                  setLantaiFilter(e.target.value);
                }}
                size="small"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value={1}>Lantai 1</MenuItem>
                <MenuItem value={2}>Lantai 2</MenuItem>
                <MenuItem value={3}>Lantai 3</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', md: 150 } }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                }}
                size="small"
              >
                {getUniqueStatusValues().map((status) => (
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
      <Modal open={open} handleClose={handleClose} />
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
}

export default TableHeader;
