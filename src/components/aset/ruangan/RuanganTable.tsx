'use client';

import React, { type MouseEvent, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { DotsThreeVertical } from '@phosphor-icons/react/dist/ssr';

import { useRuanganLab } from '@/lib/aset/RuanganLab/useRuanganLab';
import { useRuanganLabManage } from '@/lib/aset/RuanganLab/UseRuanganLabManage';
import { useRuanganUmum } from '@/lib/aset/RuanganUmum/useRuanganUmum';
import { useRuanganUmumManage } from '@/lib/aset/RuanganUmum/UseRuanganUmumManage';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useGedung } from '@/lib/gedung/gedung';
import { useRuanganFilter } from '@/contexts/RuanganContext';
import { useUsers } from '@/hooks/use-user';

import EditModal from './EditModal';

export default function AsetRuanganTable() {
  const { deleteRuanganLab } = useRuanganLab();
  const { deleteRuanganUmum } = useRuanganUmum();
  const { ruanganLabManage, loadingRuanganLabManage, getRuanganLabManage } = useRuanganLabManage();
  const { ruanganUmumManage, loadingRuanganUmumManage, getRuanganUmumManage } = useRuanganUmumManage();
  const { gedung } = useGedung();
  const { departemen } = useDepartemen();
  const { selectedAsset, departemenFilter, gedungFilter, lantaiFilter, statusFilter, searchQuery, setFilteredData } =
    useRuanganFilter();
  const { user } = useUsers();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRuanganData, setSelectedRuanganData] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [dialogOpen, setDialogOpen] = useState(false); // Dialog untuk konfirmasi delete
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // const [filteredRows, setFilteredRows] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const allowedRoles = ['ADMIN'];

  const filteredData = React.useMemo(() => {
    const data = selectedAsset === 'ruangan_umum' ? ruanganUmumManage : ruanganLabManage;

    return data.filter((item) => {
      const matchDepartemen = departemenFilter === 'All' || item.departemenId === departemenFilter;
      const matchGedung = gedungFilter === 'All' || item.gedungId === gedungFilter;
      const matchLantai = lantaiFilter === 'All' || Number(item.lantai) === Number(lantaiFilter);
      const matchStatus = statusFilter === 'All' || item.statusAset === statusFilter;

      if (!searchQuery.trim()) return true; // Jika search query kosong, tampilkan semua

      const searchTerms = searchQuery
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);

      const searchableFields = [
        item.nama,
        item.pengawasLab?.namaLengkap,
        item.kode,
        item.gedungId,
        item.harga?.toString(),
        item.statusAset,
        item.jumlah?.toString(),
        item.shift?.namaShift,
        departemen.find((d) => d.id === item.departemenId)?.nama,
        gedung.find((g) => g.id === item.gedungId)?.nama,
      ].map((field) => field?.toLowerCase() || '');

      const matchSearch = searchTerms.every((term) => searchableFields.some((field) => field.includes(term)));

      return matchDepartemen && matchGedung && matchLantai && matchStatus && matchSearch;
    });
  }, [
    selectedAsset,
    ruanganLabManage,
    ruanganUmumManage,
    departemenFilter,
    gedungFilter,
    lantaiFilter,
    statusFilter,
    searchQuery,
  ]);

  const currentData = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleClick = (event: MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (!selectedRow) return;
    setSelectedRuanganData(selectedRow);
    setEditModalOpen(true);
    handleClose();
  };

  const handleEditSuccess = async () => {
    try {
      if (selectedAsset === 'ruangan_umum') {
        await getRuanganUmumManage();
      } else {
        await getRuanganLabManage();
      }
      setSnackbarMessage('Ruangan berhasil diperbarui!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Update failed:', error);
      setSnackbarMessage('Gagal memperbarui data.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setEditModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    setDialogOpen(false); // Tutup dialog setelah konfirmasi

    try {
      if (selectedAsset === 'ruangan_umum') {
        await deleteRuanganUmum([selectedRow.id]);
        await getRuanganUmumManage(); // Refresh data
      } else {
        await deleteRuanganLab([selectedRow.id]);
        await getRuanganLabManage(); // Refresh data
      }
      setSnackbarMessage('Ruangan berhasil dihapus!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Delete failed:', error);
      setSnackbarMessage('Gagal menghapus data.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleDialogOpen = () => {
    setDialogOpen(true); // Buka dialog konfirmasi
    handleClose(); // Tutup menu setelah dialog dibuka
  };

  const handleDialogClose = () => {
    setDialogOpen(false); // Tutup dialog jika dibatalkan
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  React.useEffect(() => {
    setPage(0);
  }, [departemenFilter, gedungFilter, lantaiFilter, statusFilter, searchQuery]);

  const renderTableHead = () => {
    const commonColumns = [
      'No',
      'Pengawas Lab',
      'Kode Ruangan',
      'Nama Ruangan',
      'Departemen',
      'Gedung',
      'Lantai',
      'Harga',
      'Status',
      'Jumlah',
      'Shift',
    ];

    if (user?.role && allowedRoles.includes(user.role)) {
      commonColumns.push('Aksi');
    }

    return (
      <TableRow>
        {commonColumns.map((column) => (
          <TableCell key={column}>{column}</TableCell>
        ))}
      </TableRow>
    );
  };

  const renderTableBody = () => {
    if (loadingRuanganLabManage || loadingRuanganUmumManage) {
      return (
        <TableRow>
          <TableCell colSpan={12} align="center">
            Loading...
          </TableCell>
        </TableRow>
      );
    }

    return currentData.map((row, index) => {
      const departemenName = departemen.find((d) => d.id === row.departemenId)?.nama || 'Unknown';
      const gedungName = gedung.find((g) => g.id === row.gedungId)?.nama || 'Unknown';

      return (
        <TableRow key={row.id}>
          <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
          <TableCell>{row.pengawasLab?.namaLengkap || '-'}</TableCell>
          <TableCell>{row.kode}</TableCell>
          <TableCell>{row.nama}</TableCell>
          <TableCell>{departemenName}</TableCell>
          <TableCell>{gedungName}</TableCell>
          <TableCell>{row.lantai}</TableCell>
          <TableCell>{row.harga ? `Rp. ${Number(row.harga).toLocaleString('id-ID')}` : '-'}</TableCell>
          <TableCell>
            <Box
              sx={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '16px',
                color:
                  row.statusAset === 'TERSEDIA'
                    ? '#388e3c'
                    : row.statusAset === 'TIDAK_TERSEDIA'
                      ? '#d32f2f'
                      : '#ff9800',
                backgroundColor:
                  row.statusAset === 'TERSEDIA'
                    ? '#e8f5e9'
                    : row.statusAset === 'TIDAK_TERSEDIA'
                      ? '#ffebee'
                      : '#fff3e0',
              }}
            >
              {row.statusAset}
            </Box>
          </TableCell>

          <TableCell>{row.jumlah}</TableCell>
          <TableCell>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.shift?.namaShift}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.shift?.jamMulai} - {row.shift?.jamSelesai}
            </Typography>
          </TableCell>
          {user?.role && allowedRoles.includes(user.role) ? <TableCell>
              <IconButton onClick={(event) => { handleClick(event, row); }}>
                <DotsThreeVertical />
              </IconButton>
            </TableCell> : null}
        </TableRow>
      );
    });
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          mt: 6,
          boxShadow:
            '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          borderRadius: '8px',
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: 0,
          },
          '& .MuiTableHead-root': {
            backgroundColor: '#f5f5f5',
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            fontWeight: 'bold',
          },
          '& .MuiTableRow-root': {
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
          '& .MuiTableCell-root': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
          },
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>{renderTableHead()}</TableHead>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
          labelRowsPerPage="Baris per halaman:"
        />
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDialogOpen}>Delete</MenuItem> {/* Buka dialog konfirmasi delete */}
      </Menu>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Batal
          </Button>
          <Button onClick={handleDelete} color="error">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

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

      <EditModal
        open={editModalOpen}
        handleClose={() => { setEditModalOpen(false); }}
        initialData={selectedRuanganData}
        onSuccess={handleEditSuccess}
        selectedAsset={selectedAsset}
      />
    </>
  );
}
