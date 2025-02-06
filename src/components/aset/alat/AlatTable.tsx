'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { DotsThreeVertical } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';

import { useAlat } from '@/lib/aset/alat/useAlat';
import { useAlatManage } from '@/lib/aset/alat/UseAlatManage';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useGedung } from '@/lib/gedung/gedung';
import { useUsers } from '@/hooks/use-user';

import EditModal from './EditModal';

interface Values {
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  shift?: any;
  laboratorium: string;
}

export default function AlatTable() {
  const { deleteAlat } = useAlat();
  const {
    getAlatManage,
    alatManage,
    loadingAlatManage,
    errorAlatManage,
    pagination,
    handlePageChange,
    handleRowsPerPageChange,
  } = useAlatManage();

  const { gedung } = useGedung();
  const { departemen } = useDepartemen();
  const { user } = useUsers();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedAlatId, setSelectedAlatId] = React.useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedAlatData, setSelectedAlatData] = React.useState<Values | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const allowedRoles = ['ADMIN', 'PENGAWAS_LAB', 'KALAB'];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, alatId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedAlatId(alatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleServerPageChange = (newPage: number) => {
    handlePageChange(newPage + 1);
  };

  // const handleServerRowsPerPageChange = (newRows: number) => {
  //   handleRowsPerPageChange(newRows);
  // };

  const handleEditClick = (alatId: string) => {
    const alatToEdit = alatManage.find((item) => item.id === alatId);
    if (alatToEdit) {
      setSelectedAlatData(alatToEdit);
      setEditModalOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = (alatId: string) => {
    setSelectedAlatId(alatId);
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedAlatId) {
      setIsDeleting(true);
      try {
        const response = await deleteAlat([selectedAlatId]);
        if (response && response.message === 'Successfully deleted Alat!') {
          setSnackbarMessage('Alat berhasil dihapus!');
          setSnackbarSeverity('success');
          await getAlatManage({
            page: pagination.currentPage,
            rows: pagination.rowsPerPage,
          });
        } else {
          throw new Error(response.message || 'Unexpected response from server');
        }
      } catch (error) {
        // console.error('Delete error:', error);
        setSnackbarMessage(`Terjadi kesalahan saat menghapus alat: ${(error as Error).message}`);
        setSnackbarSeverity('error');
      } finally {
        setIsDeleting(false);
        setConfirmDeleteOpen(false);
        setSnackbarOpen(true);
        setSelectedAlatId(null);
      }
    }
  };

  if (loadingAlatManage) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (errorAlatManage) {
    return (
      <Typography color="error" align="center" style={{ marginTop: '2rem' }}>
        {errorAlatManage}
      </Typography>
    );
  }

  const getGedungName = (gedungId: string) => {
    const foundGedung = gedung.find((g) => g.id === gedungId);
    return foundGedung ? foundGedung.nama : 'Unknown';
  };

  const getDepartemenName = (departemenId: string) => {
    const foundDepartemen = departemen.find((d) => d.id === departemenId);
    return foundDepartemen ? foundDepartemen.nama : 'Unknown';
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
        <Table sx={{ minWidth: 650 }} aria-label="tabel alat">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Pengawas Lab</TableCell>
              <TableCell>Kode Alat</TableCell>
              <TableCell>Nama Alat</TableCell>
              <TableCell>Nama Laboratorium</TableCell>
              <TableCell>Departemen</TableCell>
              <TableCell>Gedung</TableCell>
              <TableCell>Lantai</TableCell>
              <TableCell>Harga</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Shift</TableCell>
              {user?.role && allowedRoles.includes(user.role) ? <TableCell>Aksi</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {alatManage.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{(pagination.currentPage - 1) * pagination.rowsPerPage + index + 1}</TableCell>
                <TableCell>{item.pengawasLab?.namaLengkap || '-'}</TableCell>
                <TableCell>{item.kode}</TableCell>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.laboratorium}</TableCell>
                <TableCell>{getDepartemenName(item.departemenId)}</TableCell>
                <TableCell>{getGedungName(item.gedungId)}</TableCell>
                <TableCell>{item.lantai}</TableCell>
                <TableCell>{item.harga ? `Rp ${Number(item.harga).toLocaleString('id-ID')}` : 'N/A'}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        item.statusAset === 'TERSEDIA'
                          ? '#388e3c'
                          : item.statusAset === 'TIDAK_TERSEDIA'
                            ? '#d32f2f'
                            : '#ff9800',
                      backgroundColor:
                        item.statusAset === 'TERSEDIA'
                          ? '#e8f5e9'
                          : item.statusAset === 'TIDAK_TERSEDIA'
                            ? '#ffebee'
                            : '#fff3e0',
                    }}
                  >
                    {item.statusAset}
                  </Box>
                </TableCell>
                <TableCell>{item.jumlah}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.shift?.namaShift}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.shift?.jamMulai} - {item.shift?.jamSelesai}
                  </Typography>
                </TableCell>
                {user?.role && allowedRoles.includes(user.role) ? (
                  <TableCell>
                    <IconButton
                      onClick={(event) => {
                        handleMenuOpen(event, item.id);
                      }}
                    >
                      <DotsThreeVertical />
                    </IconButton>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={pagination.totalData}
          page={pagination.currentPage - 1} // Konversi ke 0-based
          onPageChange={(_, newPage) => {
            handleServerPageChange(newPage);
          }}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={(e) => {
            handleRowsPerPageChange(parseInt(e.target.value, 10));
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
          labelRowsPerPage="Baris per halaman:"
        />
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleEditClick(selectedAlatId!);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteClick(selectedAlatId!);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={confirmDeleteOpen} onClose={() => !isDeleting && setConfirmDeleteOpen(false)}>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus alat ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmDeleteOpen(false);
            }}
            color="primary"
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button onClick={confirmDelete} color="error" disabled={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

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

      <EditModal
        open={editModalOpen}
        handleClose={() => {
          setEditModalOpen(false);
        }}
        initialData={selectedAlatData}
        onSuccess={() =>
          getAlatManage({
            page: pagination.currentPage,
            rows: pagination.rowsPerPage,
          })
        } // Refresh data setelah edit
      />
    </>
  );
}
