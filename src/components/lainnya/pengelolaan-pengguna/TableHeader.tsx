'use client';

import React from 'react';
import { Card, Divider, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { useDepartemen } from '@/lib/departemen/departemen';
import { useUser } from '@/lib/UserManagement/UseUser';
import { usePengelolaanPenggunaFilter } from '@/contexts/PengelolaanPenggunaContext';
import { usePopover } from '@/hooks/use-popover';

import Modal from './modal';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';

function TableHeader() {
  const { open, handleOpen, handleClose } = usePopover();
  const { departemenFilter, setDepartemenFilter, roleFilter, setRoleFilter, searchQuery, setSearchQuery } =
    usePengelolaanPenggunaFilter();
  const { users } = useUser();
  const { departemen } = useDepartemen();

  const getUniqueRoleValues = () => {
    const uniqueRole = Array.from(new Set(users.map((item: any) => item.role)));
    return ['ALL', ...uniqueRole.sort()];
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleDepartemenChange = (e: any) => {
    const newDepartemenValue = e.target.value;
    setDepartemenFilter(newDepartemenValue);
    // Reset role filter only when switching to 'All' department
    if (newDepartemenValue === 'All') {
      setRoleFilter('ALL');
    }
  };

  const handleRoleChange = (e: any) => {
    const newRoleValue = e.target.value;
    setRoleFilter(newRoleValue);
    // Only reset department filter when selecting 'ALL' role
    if (newRoleValue === 'ALL') {
      setDepartemenFilter('All');
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
              Data Pengguna
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Button
                id="tambah"
                variant="contained"
                fullWidth
                aria-label="tambah"
                endIcon={<Plus fontSize="var(--icon-fontSize-md)" />}
                sx={{
                  padding: '12px 16px',
                  minWidth: '120px',
                }}
                onClick={handleOpen}
              >
                Tambah
              </Button>
              {/* <Button
              id="export"
              variant="outlined"
              color="error"
              fullWidth
              aria-label="Export"
              endIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
              // onClick={handleExport}
            >
              Export
            </Button> */}
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
              <InputLabel id="role-filter-label">Role</InputLabel>
              <Select
                labelId="role-filter-label"
                value={roleFilter}
                label="Role"
                onChange={handleRoleChange}
                size="small"
              >
                {getUniqueRoleValues().map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
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
    </>
  );
}

export default TableHeader;
