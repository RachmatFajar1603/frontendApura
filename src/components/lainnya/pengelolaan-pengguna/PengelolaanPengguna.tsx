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

import { authClient } from '@/lib/auth/client';
import { useDepartemen } from '@/lib/departemen/departemen';
import { usePengelolaanPenggunaFilter } from '@/contexts/PengelolaanPenggunaContext';

import { useUser } from '../../../lib/UserManagement/UseUser';
import EditModal from './EditModal';

interface Values {
  id: string;
  namaLengkap: string;
  noIdentitas: string;
  email: string;
  phoneNumber: string;
  role: string;
  departemenId?: string;
  departemen?: any;
  isVerified?: boolean;
}

export default function PengelolaanPenggunaTable() {
  const { users, loading, error, getUser, currentPage, deleteUser } = useUser();

  const { departemenFilter, roleFilter, searchQuery, setFilteredPengelolaanPengguna } = usePengelolaanPenggunaFilter();

  const { departemen } = useDepartemen();

  // State untuk modal edit dan data pengguna yang dipilih
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUserData, setSelectedUserData] = React.useState<Values | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [confirmDeleteFinalOpen, setConfirmDeleteFinalOpen] = React.useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);

  // const [filteredUsers, setFilteredUsers] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const filteredData = React.useMemo(() => {
    return users.filter((item) => {
      const matchDepartemen = departemenFilter === 'All' || item.departemenId === departemenFilter;
      const matchRole = roleFilter === 'ALL' || item.role === roleFilter;

      if (!searchQuery) return matchDepartemen && matchRole;

      const searchTerms = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      const searchableFields = [
        item.namaLengkap?.toLowerCase() || '',
        item.noIdentitas?.toLowerCase() || '',
        item.email?.toLowerCase() || '',
        item.phoneNumber?.toLowerCase() || '',
        item.role?.toLowerCase() || '',
        item.departemen?.nama?.toLowerCase() || '',
      ];

      const matchSearch =
        searchTerms.length === 0 || searchTerms.every((term) => searchableFields.some((field) => field.includes(term)));

      return matchDepartemen && matchRole && matchSearch;
    });
  }, [users, departemenFilter, roleFilter, searchQuery]);

  React.useEffect(() => {
    setFilteredPengelolaanPengguna(filteredData);
  }, [filteredData, setFilteredPengelolaanPengguna]);

  const currentData = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Fungsi untuk membuka menu aksi (edit/delete)
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  // Fungsi untuk menutup menu aksi
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Fungsi untuk mengubah halaman pada tabel
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  React.useEffect(() => {
    setPage(0);
  }, [departemenFilter, roleFilter, searchQuery]);

  // Fungsi untuk membuka modal edit dan set data pengguna
  const handleEditClick = (userId: string) => {
    const userToEdit = users.find((user) => user.id === userId);
    if (userToEdit) {
      setSelectedUserData(userToEdit); // Set data pengguna yang akan diedit
      setEditModalOpen(true); // Buka modal
    }
    handleMenuClose();
  };

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };

  const handleFirstConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    setConfirmDeleteFinalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedUserId) {
      setIsDeleting(true);
      try {
        const response = await deleteUser([selectedUserId]);
        if (response && response.message === 'Successfully deleted User!') {
          setSnackbarMessage('Pengguna berhasil dihapus!');
          setSnackbarSeverity('success');
          await getUser(currentPage, rowsPerPage); // Refresh data setelah sukses
        } else {
          throw new Error(response.message || 'Unexpected response from server');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setSnackbarMessage(`Terjadi kesalahan saat menghapus pengguna: ${(error as Error).message}`);
        setSnackbarSeverity('error');
      } finally {
        setIsDeleting(false);
        setConfirmDeleteFinalOpen(false);
        setConfirmDeleteOpen(false);
        setSnackbarOpen(true);
        setSelectedUserId(null);
      }
    }
  };

  const handleResendVerification = async (userData: Values) => {
    setIsResending(true);
    try {
      const response = await authClient.resendVerification({
        email: userData.email,
        password: '', // Karena ini resend, password tidak diperlukan
        namaLengkap: userData.namaLengkap,
        noIdentitas: userData.noIdentitas,
        phoneNumber: userData.phoneNumber,
      });

      if (response.error) {
        setSnackbarMessage(response.error);
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage('Email verifikasi berhasil dikirim ulang!');
        setSnackbarSeverity('success');
      }
    } catch (error) {
      setSnackbarMessage('Terjadi kesalahan saat mengirim ulang email verifikasi');
      setSnackbarSeverity('error');
    } finally {
      setIsResending(false);
      setSnackbarOpen(true);
      handleMenuClose();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" style={{ marginTop: '2rem' }}>
        {error}
      </Typography>
    );
  }

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
        <Table sx={{ minWidth: 650 }} aria-label="tabel pengguna">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Nama Lengkap</TableCell>
              <TableCell>Departemen</TableCell>
              <TableCell>No Identitas</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Nomor Telepon</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status Verifikasi</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                <TableCell>{user.namaLengkap}</TableCell>
                <TableCell>{user.departemen?.nama || '-'}</TableCell>
                <TableCell>{user.noIdentitas}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color: '#388e3c',
                      backgroundColor: '#e8f5e9',
                    }}
                  >
                    {user.role}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color: user.isVerified ? '#388e3c' : '#d32f2f',
                      backgroundColor: user.isVerified ? '#e8f5e9' : '#ffebee',
                    }}
                  >
                    {user.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(event) => {
                      handleMenuOpen(event, user.id);
                    }}
                  >
                    <DotsThreeVertical />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
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

      {/* Menu untuk aksi edit/delete */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedUserId && users.find((user) => user.id === selectedUserId && !user.isVerified) ? (
          <MenuItem
            onClick={() => {
              const userData = users.find((user) => user.id === selectedUserId);
              if (userData) {
                handleResendVerification(userData);
              }
            }}
            disabled={isResending}
          >
            {isResending ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Mengirim...
              </Box>
            ) : (
              'Resend Email Verifikasi'
            )}
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={() => {
            handleEditClick(selectedUserId!);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteClick(selectedUserId!);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={confirmDeleteOpen} onClose={() => !isDeleting && setConfirmDeleteOpen(false)}>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>Apakah Anda yakin ingin menghapus data pengguna ini?</DialogContentText>
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
          <Button onClick={handleFirstConfirmDelete} color="error" disabled={isDeleting}>
            Lanjutkan
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteFinalOpen} onClose={() => !isDeleting && setConfirmDeleteFinalOpen(false)}>
        <DialogTitle>Peringatan Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            PERINGATAN: Tindakan ini akan menghapus data pengguna secara permanen dan tidak dapat dibatalkan. Apakah
            Anda benar-benar yakin ingin melanjutkan?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmDeleteFinalOpen(false);
            }}
            color="primary"
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button onClick={confirmDelete} color="error" disabled={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Hapus Permanen'}
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

      {/* Modal edit pengguna */}
      <EditModal
        open={editModalOpen}
        handleClose={() => {
          setEditModalOpen(false);
        }}
        initialData={selectedUserData} // Data pengguna yang akan diedit
        onSuccess={() => getUser(currentPage, rowsPerPage)} // Refresh data setelah edit
      />
    </>
  );
}
