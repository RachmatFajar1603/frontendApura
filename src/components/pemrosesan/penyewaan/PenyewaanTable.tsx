'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr/DownloadSimple';

import api from '@/lib/api';
import { useAlat } from '@/lib/aset/alat/useAlat';
import { useRuanganLab } from '@/lib/aset/RuanganLab/useRuanganLab';
import { useRuanganUmum } from '@/lib/aset/RuanganUmum/useRuanganUmum';
// import { useDepartemen } from '@/lib/departemen/departemen';
import { usePenyewaan } from '@/lib/pemrosesan/penyewaan';
import { usePenyewaanFilter } from '@/contexts/PenyewaanContext';
import { useUsers } from '@/hooks/use-user';

interface Values {
  id: string;
  namaPenyewaId: string;
  namaPenyetujuSewaId: string;
  tujuan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jamMulai?: string;
  jamSelesai?: string;
  statusAset: string;
  statusPengajuan: string;
  created_at?: string;
  updataed_at?: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: any;
  departemenId?: string;
  Departemen?: any;
  namaPenyewa?: any;
  namaPenyetuju?: any;
  RuanganUmum?: any;
  RuangLab?: any;
  Alat?: any;
  Fasilitas?: any;
  jumlahYangDisewa?: any;
  totalBiaya?: any;
  buktiPembayaran?: any;
  shiftId?: any;
  fasilitasPenyewaan?: any;
}

export default function PenyewaanTable() {
  const { penyewaan, currentPage, getPenyewaan, deletePenyewaan, updatePenyewaanStatus } =
    usePenyewaan();

  const {
    departemenFilter,
    statusPengajuanFilter,
    statusAsetFilter,
    searchQuery,
  } = usePenyewaanFilter();

  const { alat } = useAlat();
  const { ruanganLab } = useRuanganLab();
  const { ruanganUmum } = useRuanganUmum();
  // const { departemen } = useDepartemen();
  const { user } = useUsers();
  const router = useRouter();

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
  const allowedRoles = ['ADMIN', 'PENGAWAS_LAB', 'KALAB'];

  const getAsetName = (penyewaan: Values) => {
    // Prioritaskan Ruang Umum, Ruang Lab, atau Alat sesuai urutan
    if (penyewaan.ruangUmumId) {
      return penyewaan.RuanganUmum?.nama || 'Ruang Umum';
    } else if (penyewaan.ruangLabId) {
      return penyewaan.RuangLab?.nama || 'Ruang Lab';
    } else if (penyewaan.alatId) {
      return penyewaan.Alat?.nama || 'Alat';
    } 
      return 'Unknown Aset';
    
  };

  const getShiftName = (penyewa: Values) => {
    const shift = penyewa.ruangUmumId
      ? penyewa.RuanganUmum?.shift
      : penyewa.ruangLabId
        ? penyewa.RuangLab?.shift
        : penyewa.alatId
          ? penyewa.Alat?.shift
          : null;

    if (shift) {
      return `${shift.namaShift} (${shift.jamMulai} - ${shift.jamSelesai})`;
    }

    return '-';
  };

  const getJumlahAsetTersedia = (sewa: Values) => {
    if (sewa.ruangUmumId) {
      const ruangan = ruanganUmum.find((r) => r.id === sewa.ruangUmumId);
      return ruangan ? ruangan.jumlah : '-';
    } else if (sewa.ruangLabId) {
      const ruanganLabItem = ruanganLab.find((r) => r.id === sewa.ruangLabId);
      return ruanganLabItem ? ruanganLabItem.jumlah : '-';
    } else if (sewa.alatId) {
      const alatItem = alat.find((a) => a.id === sewa.alatId);
      return alatItem ? alatItem.jumlah : '-';
    }
    return '-';
  };

  const filteredData = React.useMemo(() => {
    return penyewaan.filter((item) => {
      const matchDepartemen = departemenFilter === 'All' || item.Departemen?.nama === departemenFilter;
      const matchStatus = statusPengajuanFilter === 'All' || item.statusPengajuan === statusPengajuanFilter;
      const matchAset = statusAsetFilter === 'All' || item.statusAset === statusAsetFilter;

      // Perbaikan logika pencarian
      if (!searchQuery.trim()) return true; // Jika search query kosong, tampilkan semua

      const searchTerms = searchQuery
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);

      const searchableFields = [
        item.tujuan,
        item.namaPenyewa?.namaLengkap,
        item.namaPenyetuju?.namaLengkap,
        item.Departemen?.nama,
        item.RuanganUmum?.nama,
        item.RuangLab?.nama,
        item.Alat?.nama,
        item.RuanganUmum?.shift?.namaShift,
        item.RuangLab?.shift?.namaShift,
        item.Alat?.shift?.namaShift,
        item.RuanganUmum?.shift?.jamMulai,
        item.RuangLab?.shift?.jamMulai,
        item.Alat?.shift?.jamMulai,
        item.RuanganUmum?.shift?.jamSelesai,
        item.RuangLab?.shift?.jamSelesai,
        item.Alat?.shift?.jamSelesai,
      ].map((field) => field?.toLowerCase() || '');

      // Mencari apakah setiap term ada dalam salah satu field
      const matchSearch = searchTerms.every((term) => searchableFields.some((field) => field.includes(term)));

      return matchDepartemen && matchStatus && matchAset && matchSearch;
    });
  }, [penyewaan, departemenFilter, statusPengajuanFilter, statusAsetFilter, searchQuery]);

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
    router.push(`/penyewaan/${id}`);
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
        const response = await deletePenyewaan([selectedId]);
        if (response && response.message === 'Successfully deleted penyewaan!') {
          setSnackbarMessage('Penyewaan berhasil dihapus!');
          setSnackbarSeverity('success');
          await getPenyewaan(currentPage, rowsPerPage);
        } else {
          throw new Error(response.message || 'Unexpected response from server');
        }
      } catch (error) {
        setSnackbarMessage('Penyewaan berhasil dihapus!');
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
      if (newStatus === 'DITOLAK' && !rejectionReason.trim()) {
        setSnackbarMessage('Alasan penolakan harus diisi');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      try {
        const response = await updatePenyewaanStatus(selectedId, {
          statusPengajuan: newStatus,
          deskripsiPenolakan: rejectionReason,
        });
        if (response) {
          setSnackbarMessage('Status penyewaan berhasil diubah!');
          setSnackbarSeverity('success');
          await getPenyewaan(currentPage, rowsPerPage);
        } else {
          throw new Error('Unexpected response from server');
        }
      } catch (error) {
        setSnackbarMessage('Status penyewaan gagal diubah!');
        setSnackbarSeverity('error');
      } finally {
        setUpdateStatusOpen(false);
        setSnackbarOpen(true);
        setSelectedId(null);
        setNewStatus('');
        setRejectionReason('');
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

  const handlePdfDownload = React.useCallback(async (id: string) => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/penyewaan/${id}/pdf`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `penyewaan_${id}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setSnackbarMessage('Gagal mengunduh PDF');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, []);

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
        <Table sx={{ minWidth: 650 }} aria-label="Tabel Penyewaab">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Nama Penyewa</TableCell>
              <TableCell>Nama Penyetuju</TableCell>
              <TableCell>Tujuan</TableCell>
              <TableCell>Tanggal Mulai</TableCell>
              <TableCell>Tanggal Selesai</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Status Aset</TableCell>
              <TableCell>Status Pengajuan</TableCell>
              <TableCell>Aset</TableCell>
              <TableCell>Fasilitas</TableCell>
              <TableCell>Departemen</TableCell>
              <TableCell>Jumlah Yang Disewa</TableCell>
              <TableCell>Jumlah Aset Tersedia</TableCell>
              <TableCell>Deskripsi Penolakan</TableCell>
              <TableCell>Total Biaya</TableCell>
              <TableCell>Bukti Pembayaran</TableCell>
              <TableCell>Tanda Tangan</TableCell>
              <TableCell>Surat Pernyataan</TableCell>
              {(user?.role === 'USER' || user?.role === 'MAHASISWA' || allowedRoles.includes(user?.role || '')) && (
                <TableCell>Aksi</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((sewa, index) => (
              <TableRow key={sewa.id}>
                <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                <TableCell>{sewa.namaPenyewa?.namaLengkap}</TableCell>
                <TableCell>{sewa.namaPenyetuju?.namaLengkap}</TableCell>
                <TableCell>{sewa.tujuan}</TableCell>
                <TableCell>{sewa.tanggalMulai}</TableCell>
                <TableCell>{sewa.tanggalSelesai}</TableCell>
                <TableCell>{getShiftName(sewa as Values)}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        sewa.statusAset === 'DIKEMBALIKAN'
                          ? '#388e3c'
                          : sewa.statusAset === 'PEMINJAMAN_GAGAL'
                            ? '#d32f2f'
                            : sewa.statusAset === 'SEDANG_DISEWA'
                              ? '#1976d2' // Warna teks untuk status SEDANG_DIPINJAM
                              : '#ff9800', // Warna teks default untuk status lainnya
                      backgroundColor:
                        sewa.statusAset === 'DIKEMBALIKAN'
                          ? '#e8f5e9'
                          : sewa.statusAset === 'PEMINJAMAN_GAGAL'
                            ? '#ffebee'
                            : sewa.statusAset === 'SEDANG_DISEWA'
                              ? '#e3f2fd' // Warna latar belakang untuk status SEDANG_DIPINJAM
                              : '#fff3e0', // Warna latar belakang default untuk status lainnya
                    }}
                  >
                    {sewa.statusAset}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        sewa.statusPengajuan === 'DISETUJUI'
                          ? '#388e3c'
                          : sewa.statusPengajuan === 'DITOLAK'
                            ? '#d32f2f'
                            : '#ff9800',
                      backgroundColor:
                        sewa.statusPengajuan === 'DISETUJUI'
                          ? '#e8f5e9'
                          : sewa.statusPengajuan === 'DITOLAK'
                            ? '#ffebee'
                            : '#fff3e0',
                    }}
                  >
                    {sewa.statusPengajuan}
                  </Box>
                </TableCell>
                <TableCell>{getAsetName(sewa)}</TableCell>
                <TableCell>
                  {sewa.fasilitasPenyewaan.length > 0
                    ? sewa.fasilitasPenyewaan.map(
                        (fasilitas: { fasilitas: { nama: string }; jumlahDisewa: number }, idx: number) => (
                          <div key={idx}>
                            {fasilitas.fasilitas.nama} (Jumlah: {fasilitas.jumlahDisewa})
                          </div>
                        )
                      )
                    : '-'}
                </TableCell>
                <TableCell>{sewa.Departemen?.nama}</TableCell>
                <TableCell>{sewa.jumlahYangDisewa}</TableCell>
                <TableCell>{getJumlahAsetTersedia(sewa as Values)}</TableCell>
                <TableCell>{sewa.deskripsiPenolakan || '-'}</TableCell>
                <TableCell>Rp. {sewa.totalBiaya.toLocaleString('id-ID')}</TableCell>
                <TableCell>
                  {sewa.buktiPembayaran ? (
                    <Link
                      href={sewa.buktiPembayaran}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download Tanda Bukti Pembayaran"
                    >
                      <IconButton
                        id="downloadButton"
                        aria-label="Download Bukti Pembayaran"
                        title="Download Bukti Pembayaran"
                        sx={{
                          padding: '12px',
                          minWidth: '48px',
                          minHeight: '48px',
                        }}
                      >
                        <DownloadSimple />
                      </IconButton>
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {sewa.ttdPenyewa ? (
                    <Link
                      href={sewa.ttdPenyewa}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download Tanda Tangan Peminjam"
                    >
                      <IconButton
                        id="downloadButton"
                        aria-label="Download Tanda Tangan Penyewa"
                        title="Download Tanda Tangan"
                        sx={{
                          padding: '12px',
                          minWidth: '48px',
                          minHeight: '48px',
                        }}
                      >
                        <DownloadSimple />
                      </IconButton>
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {sewa.id ? <IconButton onClick={() => handlePdfDownload(sewa.id)}>
                      <DownloadSimple />
                    </IconButton> : null}
                </TableCell>
                {(user?.role === 'USER' || user?.role === 'MAHASISWA' || allowedRoles.includes(user?.role || '')) && (
                  <TableCell>
                    {/* Untuk Admin dan Kalab selalu tampil */}
                    {user?.role === 'ADMIN' ? (
                      <IconButton onClick={(e) => sewa.id && handleMenuOpen(e, sewa.id)}>
                        <DotsThreeVertical />
                      </IconButton>
                    ) : user?.role === 'KALAB' && sewa.Departemen?.id === user?.departemenId ? (
                      <IconButton onClick={(e) => sewa.id && handleMenuOpen(e, sewa.id)}>
                        <DotsThreeVertical />
                      </IconButton>
                    ) : /* Untuk Pengawas Lab, hanya tampil jika status belum disetujui/ditolak */
                    user?.role === 'PENGAWAS_LAB' &&
                      sewa.statusPengajuan !== 'DISETUJUI' &&
                      sewa.statusPengajuan !== 'DITOLAK' ? (
                      <IconButton onClick={(e) => sewa.id && handleMenuOpen(e, sewa.id)}>
                        <DotsThreeVertical />
                      </IconButton>
                    ) : /* Untuk User dan Mahasiswa, hanya tampil jika status belum disetujui/ditolak */
                    sewa.statusPengajuan !== 'DISETUJUI' && sewa.statusPengajuan !== 'DITOLAK' ? (
                      <IconButton onClick={(e) => sewa.id && handleMenuOpen(e, sewa.id)}>
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
        {user?.role === 'ADMIN'
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
          : user?.role === 'KALAB' && penyewaan.find((p) => p.id === selectedId)?.Departemen?.id === user?.departemenId
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
            : /* Untuk Pengawas Lab, User, dan Mahasiswa, hanya tampilkan menu jika status belum disetujui/ditolak */
              penyewaan.find((p) => p.id === selectedId)?.statusPengajuan !== 'DISETUJUI' &&
              penyewaan.find((p) => p.id === selectedId)?.statusPengajuan !== 'DITOLAK' && [
                <MenuItem key="edit" onClick={() => { handleEditClick(selectedId!); }}>
                  Edit
                </MenuItem>,
                <MenuItem key="delete" onClick={() => { handleDeleteClick(selectedId!); }}>
                  Delete
                </MenuItem>,
                /* Tambahkan opsi Update Status untuk Pengawas Lab */
                user?.role === 'PENGAWAS_LAB' &&
                  penyewaan.find((p) => p.id === selectedId)?.Departemen?.id === user?.departemenId && (
                    <MenuItem
                      key="update-status"
                      onClick={() => {
                        setUpdateStatusOpen(true);
                        setSelectedId(selectedId);
                        setAnchorEl(null);
                      }}
                    >
                      Update Status
                    </MenuItem>
                  ),
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
            Apakah anda yakin ingin menghapus penyewaan ini? Tindakan ini tidak dapat dibatalkan.
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
