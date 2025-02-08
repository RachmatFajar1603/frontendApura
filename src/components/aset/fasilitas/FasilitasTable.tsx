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

import { useDepartemen } from '@/lib/departemen/departemen';
import { useFasilitas } from '@/lib/fasilitas/fasilitas';
import { useFasilitasManage } from '@/lib/fasilitas/UseFasilitasManage';
import { useGedung } from '@/lib/gedung/gedung';
import { useFasilitasFilter } from '@/contexts/FasilitasContext';
import { useUsers } from '@/hooks/use-user';

import EditModal from './EditModal';

interface Values {
  assetId: string;
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  departemen?: any;
  gedung?: any;
}

export default function FasilitasTable() {
  const { deleteFasilitas } = useFasilitas();
  const {
    fasilitasManage,
    loadingFasilitasManage,
    errorFasilitasManage,
    getFasilitasManage,
    currentPageFasilitasManage,
    rowsPerPageFasilitasManage,
  } = useFasilitasManage();
  const { gedung } = useGedung();
  const { departemen } = useDepartemen();
  const { departemenFilter, gedungFilter, lantaiFilter, statusFilter, searchQuery, setFilteredFasilitas } =
    useFasilitasFilter();
  const { user } = useUsers();

  // State untuk modal edit dan data pengguna yang dipilih
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [seleectedFasilitasId, setSelectedFasilitasId] = React.useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedFasilitasData, setSelectedFasilitasData] = React.useState<Values | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [confirmDeleteFinalOpen, setConfirmDeleteFinalOpen] = React.useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const allowedRoles = ['ADMIN'];

  const filteredData = React.useMemo(() => {
    return fasilitasManage.filter((item) => {
      const matchDepartemen = departemenFilter === 'All' || item.departemenId === departemenFilter;
      const matchGedung = gedungFilter === 'All' || item.gedungId === gedungFilter;
      const matchLantai = lantaiFilter === 'All' || Number(item.lantai) === Number(lantaiFilter);
      const matchStatus = statusFilter === 'All' || item.statusAset === statusFilter;

      if (!searchQuery) return matchDepartemen && matchGedung && matchLantai && matchStatus;

      const searchTerms = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      const searchableFields = [
        item.nama?.toLowerCase() || '',
        item.kode?.toLowerCase() || '',
        item.statusAset?.toLowerCase() || '',
        item.departemen?.nama?.toLowerCase() || '',
        item.gedung?.nama?.toLowerCase() || '',
        item.harga?.toString() || '',
        item.jumlah?.toString() || '',
        item.lantai?.toString(),
      ];

      const matchSearch =
        searchTerms.length === 0 || searchTerms.every((term) => searchableFields.some((field) => field.includes(term)));

      return matchDepartemen && matchGedung && matchLantai && matchStatus && matchSearch;
    });
  }, [fasilitasManage, departemenFilter, gedungFilter, lantaiFilter, statusFilter, searchQuery]);

  React.useEffect(() => {
    setFilteredFasilitas(filteredData);
  }, [filteredData, setFilteredFasilitas]);

  const currentData = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Fungsi untuk membuka menu aksi (edit/delete)
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, fasilitasId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedFasilitasId(fasilitasId);
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
  }, [departemenFilter, gedungFilter, lantaiFilter, statusFilter, searchQuery]);

  // Fungsi untuk membuka modal edit dan set data pengguna
  const handleEditClick = (fasilitasId: string) => {
    const fasilitasToEdit = fasilitasManage.find((fasilitas) => fasilitas.id === fasilitasId);
    if (fasilitasToEdit) {
      setSelectedFasilitasData(fasilitasToEdit); // Set data pengguna yang akan diedit
      setEditModalOpen(true); // Buka modal
    }
    handleMenuClose();
  };

  const handleDeleteClick = (fasilitasId: string) => {
    setSelectedFasilitasId(fasilitasId);
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };

  const handleFirstConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    setConfirmDeleteFinalOpen(true);
  };

  const confirmDelete = async () => {
    if (seleectedFasilitasId) {
      setIsDeleting(true);
      try {
        const response = await deleteFasilitas([seleectedFasilitasId]);
        if (response && response.message === 'Successfully deleted fasilitas!') {
          setSnackbarMessage('Fasilitas berhasil dihapus!');
          setSnackbarSeverity('success');
          await getFasilitasManage(currentPageFasilitasManage, rowsPerPageFasilitasManage);
        } else {
          throw new Error(response.message || 'Unexpected response from server');
        }
      } catch (error) {
        setSnackbarMessage(`Terjadi kesalahan saat menghapus fasilitas: ${(error as Error).message}`);
        setSnackbarSeverity('success');
      } finally {
        setIsDeleting(false);
        setConfirmDeleteFinalOpen(false);
        setSnackbarOpen(true);
        setSelectedFasilitasId(null);
      }
    }
  };

  if (loadingFasilitasManage) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (errorFasilitasManage) {
    return (
      <Typography color="error" align="center" style={{ marginTop: '2rem' }}>
        {errorFasilitasManage}
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
        <Table sx={{ minWidth: 650 }} aria-label="tabel fasilitas">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Kode Aset</TableCell>
              <TableCell>Nama Aset</TableCell>
              <TableCell>Departemen</TableCell>
              <TableCell>Gedung</TableCell>
              <TableCell>Lantai</TableCell>
              <TableCell>Harga</TableCell>
              <TableCell>Status Aset</TableCell>
              <TableCell>Jumlah</TableCell>
              {user?.role && allowedRoles.includes(user.role) ? <TableCell>Aksi</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((fasilitas, index) => (
              <TableRow key={fasilitas.id}>
                <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                <TableCell>{fasilitas.kode}</TableCell>
                <TableCell>{fasilitas.nama}</TableCell>
                <TableCell>{fasilitas.departemen?.nama}</TableCell>
                <TableCell>{fasilitas.gedung?.nama}</TableCell>
                <TableCell>{fasilitas.lantai}</TableCell>
                <TableCell>
                  {fasilitas.harga ? `Rp. ${Number(fasilitas.harga).toLocaleString('id-ID')}` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        fasilitas.statusAset === 'TERSEDIA' ||
                        fasilitas.statusAset === 'SEDANG_DIPINJAM' ||
                        fasilitas.statusAset === 'SEDANG_DISEWA'
                          ? '#388e3c' // Warna teks untuk TERSEDIA, SEDANG_DIPINJAM, atau SEDANG_DISEWA
                          : fasilitas.statusAset === 'TIDAK_TERSEDIA'
                            ? '#d32f2f' // Warna teks untuk TIDAK_TERSEDIA
                            : '#ff9800', // Warna teks default untuk status lainnya
                      backgroundColor:
                        fasilitas.statusAset === 'TERSEDIA' ||
                        fasilitas.statusAset === 'SEDANG_DIPINJAM' ||
                        fasilitas.statusAset === 'SEDANG_DISEWA'
                          ? '#e8f5e9' // Warna latar belakang untuk TERSEDIA, SEDANG_DIPINJAM, atau SEDANG_DISEWA
                          : fasilitas.statusAset === 'TIDAK_TERSEDIA'
                            ? '#ffebee' // Warna latar belakang untuk TIDAK_TERSEDIA
                            : '#fff3e0', // Warna latar belakang default untuk status lainnya
                    }}
                  >
                    {fasilitas.statusAset === 'SEDANG_DIPINJAM' || fasilitas.statusAset === 'SEDANG_DISEWA'
                      ? 'TERSEDIA' // Tampilkan "TERSEDIA" jika status adalah SEDANG_DIPINJAM atau SEDANG_DISEWA
                      : fasilitas.statusAset}
                  </Box>
                </TableCell>
                <TableCell>{fasilitas.jumlah}</TableCell>
                {user?.role && allowedRoles.includes(user.role) ? (
                  <TableCell>
                    <IconButton
                      onClick={(event) => {
                        handleMenuOpen(event, fasilitas.id);
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
        <MenuItem
          onClick={() => {
            handleEditClick(seleectedFasilitasId!);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteClick(seleectedFasilitasId!);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={confirmDeleteOpen} onClose={() => !isDeleting && setConfirmDeleteOpen(false)}>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>Apakah Anda yakin ingin menghapus data fasilitas ini?</DialogContentText>
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
          PERINGATAN: Tindakan ini akan menghapus data fasilitas secara permanen dan tidak dapat dibatalkan. Apakah Anda benar-benar yakin ingin melanjutkan?
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
        initialData={selectedFasilitasData} // Data pengguna yang akan diedit
        onSuccess={() => getFasilitasManage(currentPageFasilitasManage, rowsPerPageFasilitasManage)} // Refresh data setelah edit
      />
    </>
  );
}
