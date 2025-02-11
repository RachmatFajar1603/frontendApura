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
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr/DownloadSimple';

import api from '@/lib/api';
import { useAlat } from '@/lib/aset/alat/useAlat';
import { useAlatManage } from '@/lib/aset/alat/UseAlatManage';
import { useAlatFilter } from '@/contexts/AlatContext';
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
  pengawasLab?: any;
  departemen?: any;
  gedung?: any;
  qrCode?: any;
}

export default function AlatTable() {
  const { deleteAlat } = useAlat();
  const {
    getAlatManage,
    alatManage,
    loadingAlatManage,
    errorAlatManage,
    currentPageAlatManage,
    rowsPerPageAlatManage,
  } = useAlatManage();
  const { departemenFilter, gedungFilter, lantaiFilter, statusFilter, searchQuery, setFilteredAlat } = useAlatFilter();

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
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = React.useState(false);
  const [selectedQrCode, setSelectedQrCode] = React.useState<string | null>(null);
  const [isRegeneratingQR, setIsRegeneratingQR] = React.useState(false);
  const [secondConfirmDeleteOpen, setSecondConfirmDeleteOpen] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const filteredData = React.useMemo(() => {
    return alatManage.filter((item) => {
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
        item.pengawasLab?.namaLengkap?.toLowerCase() || '',
        item.kode?.toLowerCase() || '',
        item.laboratorium?.toLowerCase() || '',
        item.statusAset?.toLowerCase() || '',
        item.departemen?.nama?.toLowerCase() || '',
        item.gedung?.nama?.toLowerCase() || '',
        item.shift?.namaShift?.toLowerCase() || '',
        item.harga?.toString() || '',
        item.jumlah?.toString() || '',
      ];

      const matchSearch =
        searchTerms.length === 0 || searchTerms.every((term) => searchableFields.some((field) => field.includes(term)));

      return matchDepartemen && matchGedung && matchLantai && matchStatus && matchSearch;
    });
  }, [alatManage, departemenFilter, gedungFilter, lantaiFilter, statusFilter, searchQuery]);

  React.useEffect(() => {
    setFilteredAlat(filteredData);
  }, [filteredData, setFilteredAlat]);

  const currentData = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleQrCodeClick = (qrCode: string) => {
    setSelectedQrCode(qrCode);
    setQrCodeDialogOpen(true);
  };

  const allowedRoles = ['ADMIN', 'PENGAWAS_LAB', 'KALAB'];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, alatId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedAlatId(alatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  const handleFirstConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    setSecondConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAlatId) {
      setIsDeleting(true);
      try {
        const response = await deleteAlat([selectedAlatId]);
        if (response && response.message === 'Successfully deleted Alat!') {
          setSnackbarMessage('Alat berhasil dihapus!');
          setSnackbarSeverity('success');
          await getAlatManage(currentPageAlatManage, rowsPerPageAlatManage);
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
        setSecondConfirmDeleteOpen(false);
        setSnackbarOpen(true);
        setSelectedAlatId(null);
      }
    }
  };

  const handleDownloadQR = () => {
    if (selectedQrCode) {
      const link = document.createElement('a');
      const dataUrl = selectedQrCode.startsWith('data:image')
        ? selectedQrCode
        : `data:image/png;base64,${selectedQrCode}`;

      link.href = dataUrl;
      link.download = 'qr-code.png';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loadingAlatManage) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorAlatManage) {
    return (
      <Typography color="error" align="center" style={{ marginTop: '2rem' }}>
        {errorAlatManage}
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
              {user?.role && allowedRoles.includes(user.role) ? <TableCell>QR Code</TableCell> : null}
              {user?.role && allowedRoles.includes(user.role) ? <TableCell>Aksi</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                <TableCell>{item.pengawasLab?.namaLengkap || '-'}</TableCell>
                <TableCell>{item.kode}</TableCell>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.laboratorium}</TableCell>
                <TableCell>{item.departemen?.nama}</TableCell>
                <TableCell>{item.gedung?.nama}</TableCell>
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
                    {item.qrCode ? (
                      <IconButton onClick={() => handleQrCodeClick(item.qrCode)} title="Lihat QR Code">
                        <DownloadSimple />
                      </IconButton>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Tidak ada QR Code
                      </Typography>
                    )}
                  </TableCell>
                ) : null}
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
        <MenuItem
          onClick={async () => {
            if (selectedAlatId) {
              setIsRegeneratingQR(true);
              try {
                const response = await api.post(
                  `${process.env.NEXT_PUBLIC_API_URL}/alat/${selectedAlatId}/regenerate-qr`
                );
                if (response.data) {
                  setSnackbarMessage('QR Code berhasil di-generate ulang!');
                  setSnackbarSeverity('success');
                  await getAlatManage(currentPageAlatManage, rowsPerPageAlatManage);
                }
              } catch (error) {
                setSnackbarMessage('Gagal men-generate ulang QR Code');
                setSnackbarSeverity('error');
              } finally {
                setIsRegeneratingQR(false);
                setSnackbarOpen(true);
                handleMenuClose();
              }
            }
          }}
          disabled={isRegeneratingQR}
        >
          {isRegeneratingQR ? 'Generating...' : 'Regenerate QR Code'}
        </MenuItem>
      </Menu>

      <Dialog open={qrCodeDialogOpen} onClose={() => setQrCodeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
          {selectedQrCode && (
            <>
              <img
                src={
                  selectedQrCode.startsWith('data:image') ? selectedQrCode : `data:image/png;base64,${selectedQrCode}`
                }
                alt="QR Code"
                style={{ width: '300px', height: '300px', marginBottom: '20px' }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadSimple />}
                onClick={handleDownloadQR}
                sx={{ mt: 2 }}
              >
                Download QR Code
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrCodeDialogOpen(false)} color="error">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => !isDeleting && setConfirmDeleteOpen(false)}>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>Apakah Anda yakin ingin menghapus data alat ini?</DialogContentText>
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

      <Dialog open={secondConfirmDeleteOpen} onClose={() => !isDeleting && setSecondConfirmDeleteOpen(false)}>
        <DialogTitle>Peringatan Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            PERINGATAN: Tindakan ini akan menghapus data alat secara permanen dan tidak dapat dibatalkan. Apakah Anda
            benar-benar yakin ingin melanjutkan?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSecondConfirmDeleteOpen(false);
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

      <EditModal
        open={editModalOpen}
        handleClose={() => {
          setEditModalOpen(false);
        }}
        initialData={selectedAlatData}
        onSuccess={() => getAlatManage(currentPageAlatManage, rowsPerPageAlatManage)} // Refresh data setelah edit
      />
    </>
  );
}
