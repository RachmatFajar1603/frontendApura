'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  TablePagination,
  TextField,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { DotsThreeVertical } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';

import { useDepartemen } from '@/lib/departemen/departemen';
import { usePerbaikan } from '@/lib/pemrosesan/perbaikan';
import { usePerbaikanFilter } from '@/contexts/PerbaikanContext';
import { useUsers } from '@/hooks/use-user';

interface Values {
  id: string;
  namaPenyetujuPerbaikanId: string;
  namaPengajuId: string;
  ruangUmumId?: any;
  ruangLabId?: any;
  alatId?: any;
  fasilitasId?: any;
  deskripsi: string;
  kondisiAset: string;
  departemenId?: string;
  statusAset: string;
  statusPengajuan: string;
  Departemen?: any;
  RuanganUmum?: any;
  RuangLab?: any;
  Alat?: any;
  Fasilitas?: any;
  namaPengaju?: any;
  namaPenyetujuPerbaikan?: any;
}

export default function PerbaikanTable() {
  const { perbaikan, totalData, currentPage, getPerbaikan, updatePerbaikanStatus, deletePerbaikan } =
    usePerbaikan();

  const {
    departemenFilter,
    statusPengajuanFilter,
    statusAsetFilter,
    searchQuery,
  } = usePerbaikanFilter();

  const { departemen } = useDepartemen();
  const router = useRouter();
  const { user } = useUsers();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const allowedRoles = ['ADMIN'];

  const getAsetName = (perbaikan: Values) => {
    // Prioritaskan Ruang Umum, Ruang Lab, atau Alat sesuai urutan
    if (perbaikan.ruangUmumId) {
      return perbaikan.RuanganUmum?.nama || 'Ruang Umum';
    } else if (perbaikan.ruangLabId) {
      return perbaikan.RuangLab?.nama || 'Ruang Lab';
    } else if (perbaikan.alatId) {
      return perbaikan.Alat?.nama || 'Alat';
    } else if (perbaikan.fasilitasId) {
      return perbaikan.Fasilitas?.nama || 'Fasilitas';
    } 
      return '-';
    
  };

  const filteredData = React.useMemo(() => {
    return perbaikan.filter((item) => {
      const matchDepartemen = departemenFilter === 'All' || item.Departemen?.nama === departemenFilter;
      const matchStatus = statusPengajuanFilter === 'All' || item.statusPengajuan === statusPengajuanFilter;
      const matchAset = statusAsetFilter === 'All' || item.statusAset === statusAsetFilter;

      if (!searchQuery.trim()) return true; // Jika search query kosong, tampilkan semua

      const searchTerms = searchQuery
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);

      const searchableFields = [
        item.deskripsi,
        item.namaPengaju?.namaLengkap,
        item.namaPenyetujuPerbaikan?.namaLengkap,
        item.kondisiAset,
        item.deskripsiPenolakan,
        getAsetName(item as Values),
        departemen.find((d) => d.id === item.departemenId)?.nama,
      ].map((field) => field?.toLowerCase() || '');

      const matchSearch = searchTerms.every((term) => searchableFields.some((field) => field.includes(term)));

      return matchDepartemen && matchStatus && matchAset && matchSearch;
    });
  }, [perbaikan, departemenFilter, statusPengajuanFilter, statusAsetFilter, searchQuery]);

  const currentData = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = (id: string) => {
    router.push(`/perbaikan/${id}`);
    handleMenuClose();
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedId) {
      setIsDeleting(true);
      try {
        const response = await deletePerbaikan([selectedId]);
        if (response && response.message === 'Successfully deleted peminjaman!') {
          setSnackbarMessage('Peminjaman berhasil dihapus!');
          setSnackbarSeverity('success');
          await getPerbaikan(currentPage, rowsPerPage);
        } else {
          throw new Error(response.message || 'Unexpected response from server');
        }
      } catch (error) {
        setSnackbarMessage('Perbaikan berhasil dihapus!');
        setSnackbarSeverity('success');
      } finally {
        setIsDeleting(false);
        setConfirmDeleteOpen(false);
        setSnackbarOpen(true);
        setSelectedId(null);
      }
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedId && newStatus) {
      try {
        const response = await updatePerbaikanStatus(selectedId, {
          statusPengajuan: newStatus,
          deskripsiPenolakan: rejectionReason,
        });
        if (response) {
          setSnackbarMessage('Status berhasil diubah!');
          setSnackbarSeverity('success');
          await getPerbaikan(currentPage, rowsPerPage);
        } else {
          throw new Error('Unexpected response from server');
        }
      } catch (error) {
        setSnackbarMessage('Terjadi kesalahan saat mengubah status: Setujui atau Ditolak Terlebih Dahulu');
        setSnackbarSeverity('error');
      } finally {
        setUpdateStatusOpen(false);
        setSnackbarOpen(true);
        setSelectedId(null);
      }
    }
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
  }, [departemenFilter, statusPengajuanFilter, statusAsetFilter, searchQuery]);

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
        <Table sx={{ minWidth: 650 }} aria-label="Tabel Peminjaman">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Nama Penyetuju Perbaikan</TableCell>
              <TableCell>Nama Pengaju</TableCell>
              <TableCell>Aset</TableCell>
              <TableCell>Deskripsi</TableCell>
              {/* <TableCell>Jumlah Aset Yang Tersedia</TableCell> */}
              <TableCell>Jumlah Yang Diperbaiki</TableCell>
              <TableCell>Kondisi Aset</TableCell>
              <TableCell>Departemen</TableCell>
              <TableCell>Status Aset</TableCell>
              <TableCell>Status Pengajuan</TableCell>
              <TableCell>Deskripsi Penolakan</TableCell>
              {(user?.role === 'KALAB' || user?.role === 'PENGAWAS_LAB' || allowedRoles.includes(user?.role || '')) && (
                <TableCell>Aksi</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((perbaikan, index) => (
              <TableRow key={perbaikan.id}>
                <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                <TableCell>{perbaikan.namaPenyetujuPerbaikan?.namaLengkap}</TableCell>
                <TableCell>{perbaikan.namaPengaju?.namaLengkap}</TableCell>
                <TableCell>{getAsetName(perbaikan)}</TableCell>
                <TableCell>{perbaikan.deskripsi}</TableCell>
                {/* <TableCell>{perbaikan.jumlahAsetYangTersedia}</TableCell> */}
                <TableCell>{perbaikan.jumlahYangDiPerbaiki}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color: '#d32f2f',
                      backgroundColor: '#ffebee',
                    }}
                  >
                    {perbaikan.kondisiAset}
                  </Box>
                </TableCell>
                <TableCell>{perbaikan.Departemen?.nama}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        perbaikan.statusAset === 'SEDANG_DIPERBAIKI'
                          ? '#388e3c'
                          : perbaikan.statusAset === 'PENGAJUAN_PERBAIKAN_GAGAL'
                            ? '#d32f2f'
                            : perbaikan.statusAset === 'PERBAIKAN_SELESAI'
                              ? '#388e3c'
                              : '#ff9800',
                      backgroundColor:
                        perbaikan.statusAset === 'SEDANG_DIPERBAIKI'
                          ? '#e8f5e9'
                          : perbaikan.statusAset === 'PENGAJUAN_PERBAIKAN_GAGAL'
                            ? '#ffebee'
                            : perbaikan.statusAset === 'PERBAIKAN_SELESAI'
                              ? '#e8f5e9'
                              : '#fff3e0',
                    }}
                  >
                    {perbaikan.statusAset}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        perbaikan.statusPengajuan === 'DISETUJUI'
                          ? '#388e3c'
                          : perbaikan.statusPengajuan === 'DITOLAK'
                            ? '#d32f2f'
                            : perbaikan.statusPengajuan === 'SELESAI'
                              ? '#388e3c'
                              : '#ff9800',
                      backgroundColor:
                        perbaikan.statusPengajuan === 'DISETUJUI'
                          ? '#e8f5e9'
                          : perbaikan.statusPengajuan === 'DITOLAK'
                            ? '#ffebee'
                            : perbaikan.statusPengajuan === 'SELESAI'
                              ? '#e8f5e9'
                              : '#fff3e0',
                    }}
                  >
                    {perbaikan.statusPengajuan}
                  </Box>
                </TableCell>
                <TableCell>
                  {perbaikan.statusPengajuan === 'SELESAI' || perbaikan.statusPengajuan === 'DISETUJUI'
                    ? '-'
                    : perbaikan.deskripsiPenolakan}
                </TableCell>
                {(user?.role === 'KALAB' ||
                  user?.role === 'PENGAWAS_LAB' ||
                  allowedRoles.includes(user?.role || '')) && (
                  <TableCell>
                    {allowedRoles.includes(user?.role || '') ? (
                      <IconButton onClick={(e) => perbaikan.id && handleMenuOpen(e, perbaikan.id)}>
                        <DotsThreeVertical />
                      </IconButton>
                    ) : perbaikan.statusPengajuan !== 'SELESAI' &&
                      perbaikan.statusPengajuan !== 'DISETUJUI' &&
                      perbaikan.statusPengajuan !== 'DITOLAK' ? (
                      <IconButton onClick={(e) => perbaikan.id && handleMenuOpen(e, perbaikan.id)}>
                        <DotsThreeVertical />
                      </IconButton>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                )}
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {allowedRoles.includes(user?.role || '')
          ? [
              <MenuItem key="edit" onClick={() => { handleEditClick(selectedId!); }}>
                Edit
              </MenuItem>,
              <MenuItem key="delete" onClick={() => { handleDeleteClick(selectedId!); }}>
                Delete
              </MenuItem>,
              <MenuItem
                key="update-status"
                onClick={() => {
                  setUpdateStatusOpen(true);
                  setSelectedId(selectedId);
                  setAnchorEl(null);
                }}
              >
                Update Status
              </MenuItem>,
            ]
          : perbaikan.find((p) => p.id === selectedId)?.statusPengajuan !== 'SELESAI' &&
            perbaikan.find((p) => p.id === selectedId)?.statusPengajuan !== 'DISETUJUI' &&
            perbaikan.find((p) => p.id === selectedId)?.statusPengajuan !== 'DITOLAK' && [
              <MenuItem key="edit" onClick={() => { handleEditClick(selectedId!); }}>
                Edit
              </MenuItem>,
              <MenuItem key="delete" onClick={() => { handleDeleteClick(selectedId!); }}>
                Delete
              </MenuItem>,
            ]}
      </Menu>

      <Dialog
        open={updateStatusOpen}
        onClose={() => {
          setUpdateStatusOpen(false);
          setNewStatus('');
          setRejectionReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Status Pengajuan</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={newStatus}
                label="Status"
                onChange={(event) => {
                  setNewStatus(event.target.value);
                  // Reset rejection reason when changing status
                  setRejectionReason('');
                }}
              >
                <MenuItem value="SELESAI">SELESAI</MenuItem>
                <MenuItem value="DISETUJUI">DISETUJUI</MenuItem>
                <MenuItem value="DITOLAK">DITOLAK</MenuItem>
              </Select>
            </FormControl>

            {newStatus === 'DITOLAK' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Alasan Penolakan"
                variant="outlined"
                value={rejectionReason}
                onChange={(e) => { setRejectionReason(e.target.value); }}
                error={!rejectionReason.trim()}
                helperText={!rejectionReason.trim() ? 'Alasan penolakan harus diisi' : ''}
                placeholder="Masukkan alasan penolakan secara detail"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUpdateStatusOpen(false);
              setNewStatus('');
              setRejectionReason('');
            }}
            color="primary"
          >
            Batal
          </Button>
          <Button
            onClick={handleUpdateStatus}
            color="primary"
            disabled={!newStatus || (newStatus === 'DITOLAK' && !rejectionReason.trim())}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => !isDeleting && setConfirmDeleteOpen(false)}>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah anda yakin ingin menghapus peminjaman ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmDeleteOpen(false); }} color="primary" disabled={isDeleting}>
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
