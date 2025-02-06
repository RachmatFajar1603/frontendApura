'use client';

import React from 'react';
import {
  Alert,
  Card,
  debounce,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import api from '@/lib/api';
import { useAlatManage } from '@/lib/aset/alat/UseAlatManage';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useGedung } from '@/lib/gedung/gedung';
import { usePopover } from '@/hooks/use-popover';
import { useUsers } from '@/hooks/use-user';

import Modal from './modal';

type StatusOption = 'TERSEDIA' | 'TIDAK_TERSEDIA' | 'DIPERBAIKI';

function TableHeader() {
  const { open, handleOpen, handleClose } = usePopover();

  const { handleFilter, filters } = useAlatManage();
  const { departemen } = useDepartemen();
  const { gedung } = useGedung();
  const { user } = useUsers();
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const statusOptions: StatusOption[] = ['TERSEDIA', 'TIDAK_TERSEDIA', 'DIPERBAIKI'];

  // Update handler filter
  const handleFilterChange = (type: 'search' | 'exact', field: string, value: string) => {
    const filterMap: Record<string, string> = {
      departemen: 'departemenId',
      gedung: 'gedungId',
      lantai: 'lantai',
      status: 'StatusAset',
    };

    const actualField = filterMap[field] || field;

    if (value === 'All') {
      handleFilter(type, actualField, '');
    } else {
      handleFilter(type, actualField, value);
    }
  };

  // Update search handler
  const debouncedSearch = debounce((value: string) => {
    handleFilter('search', 'nama', value);
  }, 500);

  const restrictedRoles = ['DEKAN', 'WD2', 'KADEP'];

  const handleExport = async () => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/alat/export/excel`, {
        responseType: 'blob', // Specify that we expect a Blob response
      });
      if (!response.data) {
        throw new Error('Failed to export data');
      }
      const url = window.URL.createObjectURL(response.data); // Use response.data directly
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'alat_data.xlsx'); // Set the file name
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
              {user?.role && !restrictedRoles.includes(user.role) ? <Button
                  id="tambah"
                  variant="contained"
                  fullWidth
                  aria-label="tambah"
                  sx={{
                    bgcolor: '#9a221a',
                    '&:hover': { bgcolor: '#f04438' },
                    padding: '12px 16px',
                    minWidth: '120px',
                  }}
                  onClick={handleOpen}
                >
                  Tambah
                </Button> : null}
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
            <FormControl sx={{ width: { xs: '100%', md: 200 } }}>
              <InputLabel id="departemen-filter-label">Departemen</InputLabel>
              <Select
                labelId="departemen-filter-label"
                value={filters.exact.departemenId || 'All'}
                label="Departemen"
                onChange={(e) => { handleFilterChange('exact', 'departemen', e.target.value); }}
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
              <InputLabel id="gedung-filter-label">Gedung</InputLabel>
              <Select
                labelId="gedung-filter-label"
                value={filters.exact.gedungId || 'All'}
                label="Gedung"
                onChange={(e) => { handleFilterChange('exact', 'gedung', e.target.value); }}
                size="small"
              >
                <MenuItem value="All">All</MenuItem>
                {gedung.map((ged) => (
                  <MenuItem key={ged.id} value={ged.id}>
                    {ged.nama}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', md: 200 } }}>
              <InputLabel id="lantai-filter-label">Lantai</InputLabel>
              <Select
                labelId="lantai-filter-label"
                value={filters.exact.lantai || 'All'}
                label="Lantai"
                onChange={(e) => { handleFilterChange('exact', 'lantai', e.target.value); }}
                size="small"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value={1}>Lantai 1</MenuItem>
                <MenuItem value={2}>Lantai 2</MenuItem>
                <MenuItem value={3}>Lantai 3</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', md: 200 } }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filters.exact.StatusAset || 'All'}
                label="Status"
                onChange={(e) => { handleFilterChange('exact', 'statusAset', e.target.value); }}
                size="small"
              >
                <MenuItem value="All">All</MenuItem>
                {statusOptions.map((status) => (
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
              defaultValue={filters.search.nama || ''}
              onChange={(e) => { debouncedSearch(e.target.value); }}
              size="small"
              sx={{ width: { xs: '100%', md: 200 } }}
              placeholder="Cari berdasarkan nama..."
            />
          </Box>
        </Box>
      </Card>
      <Modal open={open} handleClose={handleClose} />
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
