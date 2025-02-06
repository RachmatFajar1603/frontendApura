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
import { usePengembalian } from '@/lib/pemrosesan/pengembalian';
import { usePengembalianFilter } from '@/contexts/PengembalianContext';
import { useUsers } from '@/hooks/use-user';

interface Values {
  id: string;
  peminjamanId?: string;
  penyewaanId?: string;
  userId?: string;
  namaPenyetujuId?: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: any;
  departemenId?: string;
  tanggalPengembalian?: string;
  jumlahPinjamYangDikembalikan?: number;
  jumlahSewaYangDikembalikan?: number;
  tujuan?: string;
  kondisiAset?: string;
  statusAset?: string;
  deskripsiKerusakan?: any;
  denda?: any;
  statusPengembalian?: any;
  Peminjaman?: any;
  Penyewaan?: any;
  namaPenyetuju?: any;
  deskripsiPenolakan?: any;
  fasilitasPengembalian?: any;
}

export default function PengembalianTable() {
  const {
    pengembalian,
    totalData,
    currentPage,
    getPengembalian,
    deletePengembalian,
    updatePengembalianStatus,
  } = usePengembalian();

  const {
    statusPengembalianFilter,
    statusAsetFilter,
    searchQuery,
    typeFilter,
  } = usePengembalianFilter();
  const { user } = useUsers();
  // const { departemen } = useDepartemen();
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

  const getPermrosesanName = (pengembalian: Values) => {
    if (pengembalian.Peminjaman) {
      return 'Peminjaman';
    } else if (pengembalian.Penyewaan) {
      return 'Penyewaan';
    } 
      return '-';
    
  };

  const getName = (pengembalian: Values) => {
    if (pengembalian.Peminjaman) {
      return pengembalian.Peminjaman.namaPeminjam.namaLengkap;
    } else if (pengembalian.Penyewaan) {
      return pengembalian.Penyewaan.namaPenyewa.namaLengkap;
    } 
      return '-';
    
  };

  const getKodeAset = (pengembalian: Values) => {
    if (pengembalian.Peminjaman) {
      if (pengembalian.Peminjaman.RuanganUmum) {
        return pengembalian.Peminjaman.RuanganUmum.kode;
      } else if (pengembalian.Peminjaman.RuangLab) {
        return pengembalian.Peminjaman.RuangLab.kode;
      } else if (pengembalian.Peminjaman.Alat) {
        return pengembalian.Peminjaman.Alat.kode;
      } else if (pengembalian.Peminjaman.Fasilitas) {
        return pengembalian.Peminjaman.Fasilitas.kode;
      }
    } else if (pengembalian.Penyewaan) {
      if (pengembalian.Penyewaan.RuanganUmum) {
        return pengembalian.Penyewaan.RuanganUmum.kode;
      } else if (pengembalian.Penyewaan.RuangLab) {
        return pengembalian.Penyewaan.RuangLab.kode;
      } else if (pengembalian.Penyewaan.Alat) {
        return pengembalian.Penyewaan.Alat.kode;
      } else if (pengembalian.Penyewaan.Fasilitas) {
        return pengembalian.Penyewaan.Fasilitas.kode;
      }
    }
    return '-';
  };

  const getAsetName = (pengembalian: Values) => {
    if (pengembalian.Peminjaman) {
      return (
        pengembalian.Peminjaman.Alat?.nama ||
        pengembalian.Peminjaman.RuanganUmum?.nama ||
        pengembalian.Peminjaman.RuangLab?.nama ||
        pengembalian.Peminjaman.Fasilitas?.nama ||
        '-'
      );
    } else if (pengembalian.Penyewaan) {
      return (
        pengembalian.Penyewaan.Alat?.nama ||
        pengembalian.Penyewaan.RuanganUmum?.nama ||
        pengembalian.Penyewaan.RuangLab?.nama ||
        pengembalian.Penyewaan.Fasilitas?.nama ||
        '-'
      );
    }
    return '-';
  };

  const filteredData = React.useMemo(() => {
    return pengembalian.filter((item) => {
      const matchType = typeFilter === 'All' || getPermrosesanName(item as Values) === typeFilter;
      const matchStatusPengembalian =
        statusPengembalianFilter === 'All' || item.statusPengembalian === statusPengembalianFilter;
      const matchStatusAset = statusAsetFilter === 'All' || item.statusAset === statusAsetFilter;

      if (!searchQuery.trim()) return true;

      const searchTerms = searchQuery
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);

      // Helper function untuk mengkonversi field ke string
      const convertToString = (field: any): string => {
        if (field === null || field === undefined) return '';
        if (typeof field === 'string') return field.toLowerCase();
        if (typeof field === 'object') {
          if ('nama' in field) return field.nama?.toLowerCase() || '';
          if ('kode' in field) return field.kode?.toLowerCase() || '';
          if ('namaLengkap' in field) return field.namaLengkap?.toLowerCase() || '';
        }
        return '';
      };

      const searchableFields = [
        convertToString(item.tujuan),
        convertToString(item.namaPenyetuju?.namaLengkap),
        convertToString(getPermrosesanName(item as Values)),
        convertToString(item.Peminjaman?.namaPeminjam?.namaLengkap),
        convertToString(item.Penyewaan?.namaPenyewa?.namaLengkap),
        convertToString(item.Peminjaman?.RuanganUmum?.kode),
        convertToString(item.Peminjaman?.RuanganUmum?.nama),
        convertToString(item.Penyewaan?.RuanganUmum?.kode),
        convertToString(item.Penyewaan?.RuanganUmum?.nama),
        convertToString(item.Peminjaman?.RuangLab?.kode),
        convertToString(item.Peminjaman?.RuangLab?.nama),
        convertToString(item.Penyewaan?.RuangLab?.kode),
        convertToString(item.Penyewaan?.RuangLab?.nama),
        convertToString(item.Peminjaman?.Alat?.kode),
        convertToString(item.Peminjaman?.Alat?.nama),
        convertToString(item.Penyewaan?.Alat?.kode),
        convertToString(item.Penyewaan?.Alat?.nama),
        convertToString(item.Peminjaman?.Fasilitas?.kode),
        convertToString(item.Peminjaman?.Fasilitas?.nama),
        convertToString(item.Penyewaan?.Fasilitas?.kode),
        convertToString(item.Penyewaan?.Fasilitas?.nama),
      ].filter(Boolean); // Menghapus string kosong

      const matchSearch = searchTerms.every((term) => searchableFields.some((field) => field.includes(term)));

      return matchType && matchStatusPengembalian && matchStatusAset && matchSearch;
    });
  }, [pengembalian, typeFilter, statusPengembalianFilter, statusAsetFilter, searchQuery]);

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
    router.push(`/pengembalian/${id}`);
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
        const response = await deletePengembalian([selectedId]);
        if (response && response.message === 'Successfully deleted pengembalian!') {
          setSnackbarMessage('Pengembalian berhasil dihapus!');
          setSnackbarSeverity('success');
        } else {
          throw new Error(response.message || 'Unexpected response from server');
        }
      } catch (error) {
        setSnackbarMessage('Pengembalian berhasil dihapus!');
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
        const response = await updatePengembalianStatus(selectedId, {
          statusPengembalian: newStatus,
          deskripsiPenolakan: rejectionReason,
        });
        if (response) {
          setSnackbarMessage('Status berhasil diubah!');
          setSnackbarSeverity('success');
          await getPengembalian(currentPage, rowsPerPage);
        } else {
          throw new Error('Unexpected response from server');
        }
      } catch (error) {
        setSnackbarMessage('Terjadi kesalahan saat mengubah status');
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
  }, [typeFilter, statusPengembalianFilter, statusAsetFilter, searchQuery]);

  const getJumlah = (pengembalian: Values) => {
    if (pengembalian.Peminjaman) {
      return pengembalian.Peminjaman.jumlahYangDipinjam;
    } else if (pengembalian.Penyewaan) {
      return pengembalian.Penyewaan.jumlahYangDisewa;
    } 
      return '-';
    
  };

  const getTanggalMulai = (pengembalian: Values) => {
    if (pengembalian.Peminjaman) {
      return pengembalian.Peminjaman.tanggalMulai;
    } else if (pengembalian.Penyewaan) {
      return pengembalian.Penyewaan.tanggalMulai;
    } 
      return '-';
    
  };

  const getTanggalSelesai = (pengembalian: Values) => {
    if (pengembalian.Peminjaman) {
      return pengembalian.Peminjaman.tanggalSelesai;
    } else if (pengembalian.Penyewaan) {
      return pengembalian.Penyewaan.tanggalSelesai;
    } 
      return '-';
    
  };

  const getShift = (pengembalian: Values) => {
    if (pengembalian.Peminjaman) {
      if (pengembalian.Peminjaman.Alat) {
        return (
          `${pengembalian.Peminjaman.Alat.shift.namaShift 
          } ${ 
          pengembalian.Peminjaman.Alat.shift.jamMulai 
          } - ${ 
          pengembalian.Peminjaman.Alat.shift.jamSelesai}`
        );
      } else if (pengembalian.Peminjaman.RuanganUmum) {
        return (
          `${pengembalian.Peminjaman.RuanganUmum.shift.namaShift 
          } ${ 
          pengembalian.Peminjaman.RuanganUmum.shift.jamMulai 
          } - ${ 
          pengembalian.Peminjaman.RuanganUmum.shift.jamSelesai}`
        );
      } else if (pengembalian.Peminjaman.RuangLab) {
        return (
          `${pengembalian.Peminjaman.RuangLab.shift.namaShift 
          } ${ 
          pengembalian.Peminjaman.RuangLab.shift.jamMulai 
          } - ${ 
          pengembalian.Peminjaman.RuangLab.shift.jamSelesai}`
        );
      }
    } else if (pengembalian.Penyewaan) {
      if (pengembalian.Penyewaan.Alat) {
        return (
          `${pengembalian.Penyewaan.Alat.shift.namaShift 
          } ${ 
          pengembalian.Penyewaan.Alat.shift.jamMulai 
          } - ${ 
          pengembalian.Penyewaan.Alat.shift.jamSelesai}`
        );
      } else if (pengembalian.Penyewaan.RuanganUmum) {
        return (
          `${pengembalian.Penyewaan.RuanganUmum.shift.namaShift 
          } ${ 
          pengembalian.Penyewaan.RuanganUmum.shift.jamMulai 
          } - ${ 
          pengembalian.Penyewaan.RuanganUmum.shift.jamSelesai}`
        );
      } else if (pengembalian.Penyewaan.RuangLab) {
        return (
          `${pengembalian.Penyewaan.RuangLab.shift.namaShift 
          } ${ 
          pengembalian.Penyewaan.RuangLab.shift.jamMulai 
          } - ${ 
          pengembalian.Penyewaan.RuangLab.shift.jamSelesai}`
        );
      }
    }
    return '-';
  };

  const getJumlahYangDikembalikan = (pengembalian: Values) => {
    if (pengembalian.Peminjaman) {
      return pengembalian.jumlahPinjamYangDikembalikan;
    } else if (pengembalian.Penyewaan) {
      return pengembalian.jumlahSewaYangDikembalikan;
    } 
      return '-';
    
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
        <Table sx={{ minWidth: 650 }} aria-label="Tabel Peminjaman">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Pemrosesan</TableCell>
              <TableCell>Nama Pengaju</TableCell>
              <TableCell>Nama Penyetuju</TableCell>
              <TableCell>Kode Aset</TableCell>
              <TableCell>Aset</TableCell>
              <TableCell>Jumlah Yang Diajukan</TableCell>
              <TableCell>Tanggal Mulai</TableCell>
              <TableCell>Tanggal Selesai</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Fasilitas</TableCell>
              <TableCell>Total Biaya</TableCell>
              <TableCell>Tanggal Pengembalian</TableCell>
              <TableCell>Jumlah Yang Dikembalikan</TableCell>
              <TableCell>Tujuan</TableCell>
              <TableCell>Deskripsi Kerusakan</TableCell>
              <TableCell>Kondisi Aset</TableCell>
              <TableCell>Denda</TableCell>
              <TableCell>Status Aset</TableCell>
              <TableCell>Status Pengembalian</TableCell>
              <TableCell>Deskripsi Penolakan</TableCell>
              {(user?.role === 'USER' || user?.role === 'MAHASISWA' || allowedRoles.includes(user?.role || '')) && (
                <TableCell>Aksi</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((pengembalian, index) => (
              <TableRow key={pengembalian.id}>
                <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                <TableCell>{getPermrosesanName(pengembalian)}</TableCell>
                <TableCell>{getName(pengembalian)}</TableCell>
                <TableCell>{pengembalian.namaPenyetuju?.namaLengkap || '-'}</TableCell>
                <TableCell>{getKodeAset(pengembalian)}</TableCell>
                <TableCell>{getAsetName(pengembalian)}</TableCell>
                <TableCell>{getJumlah(pengembalian)}</TableCell>
                <TableCell>{getTanggalMulai(pengembalian)}</TableCell>
                <TableCell>{getTanggalSelesai(pengembalian)}</TableCell>
                <TableCell>{getShift(pengembalian)}</TableCell>
                <TableCell>
                  {pengembalian.Peminjaman?.fasilitasPeminjaman &&
                  pengembalian.Peminjaman.fasilitasPeminjaman.length > 0
                    ? pengembalian.Peminjaman.fasilitasPeminjaman.map(
                        (fasilitas: { fasilitas: { nama: string }; jumlahDipinjam: number }, idx: number) => (
                          <div key={idx}>
                            {fasilitas.fasilitas.nama} (Jumlah: {fasilitas.jumlahDipinjam})
                          </div>
                        )
                      )
                    : pengembalian.Penyewaan?.fasilitasPenyewaan && pengembalian.Penyewaan.fasilitasPenyewaan.length > 0
                      ? pengembalian.Penyewaan.fasilitasPenyewaan.map(
                          (fasilitas: { fasilitas: { nama: string }; jumlahDisewa: number }, idx: number) => (
                            <div key={idx}>
                              {fasilitas.fasilitas.nama} (Jumlah: {fasilitas.jumlahDisewa})
                            </div>
                          )
                        )
                      : '-'}
                </TableCell>
                <TableCell>
                  {pengembalian.Penyewaan?.totalBiaya
                    ? `Rp. ${pengembalian.Penyewaan.totalBiaya.toLocaleString('id-ID')}`
                    : '-'}
                </TableCell>
                <TableCell>{pengembalian.tanggalPengembalian}</TableCell>
                <TableCell>{getJumlahYangDikembalikan(pengembalian)}</TableCell>
                <TableCell>{pengembalian.tujuan}</TableCell>
                <TableCell>
                  {pengembalian.kondisiAset === 'BAIK' ? '-' : pengembalian.deskripsiKerusakan || '-'}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        pengembalian.kondisiAset === 'BAIK'
                          ? '#388e3c'
                          : pengembalian.kondisiAset === 'RUSAK'
                            ? '#d32f2f'
                            : '#ff9800',
                      backgroundColor:
                        pengembalian.kondisiAset === 'BAIK'
                          ? '#e8f5e9'
                          : pengembalian.kondisiAset === 'RUSAK'
                            ? '#ffebee'
                            : '#fff3e0',
                    }}
                  >
                    {pengembalian.kondisiAset}
                  </Box>
                </TableCell>
                <TableCell>{pengembalian.denda ? `Rp. ${pengembalian.denda.toLocaleString('id-ID')}` : '-'}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        pengembalian.statusAset === 'DIKEMBALIKAN'
                          ? '#388e3c'
                          : pengembalian.statusAset === 'PENGAJUAN_PERBAIKAN_GAGAL'
                            ? '#d32f2f'
                            : '#ff9800',
                      backgroundColor:
                        pengembalian.statusAset === 'DIKEMBALIKAN'
                          ? '#e8f5e9'
                          : pengembalian.statusAset === 'PENGAJUAN_PERBAIKAN_GAGAL'
                            ? '#ffebee'
                            : '#fff3e0',
                    }}
                  >
                    {pengembalian.statusAset}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        pengembalian.statusPengembalian === 'DISETUJUI'
                          ? '#388e3c'
                          : pengembalian.statusPengembalian === 'DITOLAK'
                            ? '#d32f2f'
                            : '#ff9800',
                      backgroundColor:
                        pengembalian.statusPengembalian === 'DISETUJUI'
                          ? '#e8f5e9'
                          : pengembalian.statusPengembalian === 'DITOLAK'
                            ? '#ffebee'
                            : '#fff3e0',
                    }}
                  >
                    {pengembalian.statusPengembalian}
                  </Box>
                </TableCell>
                <TableCell>{pengembalian.deskripsiPenolakan || '-'}</TableCell>
                {(user?.role === 'USER' || user?.role === 'MAHASISWA' || allowedRoles.includes(user?.role || '')) && (
                  <TableCell>
                    {/* Untuk Admin dan Kalab selalu tampil */}
                    {user?.role === 'ADMIN' ? (
                      <IconButton onClick={(e) => pengembalian.id && handleMenuOpen(e, pengembalian.id)}>
                        <DotsThreeVertical />
                      </IconButton>
                    ) : user?.role === 'KALAB' && pengembalian.departemenId === user?.departemenId ? (
                      <IconButton onClick={(e) => pengembalian.id && handleMenuOpen(e, pengembalian.id)}>
                        <DotsThreeVertical />
                      </IconButton>
                    ) : /* Untuk Pengawas Lab, hanya tampil jika status belum disetujui/ditolak */
                    user?.role === 'PENGAWAS_LAB' &&
                      pengembalian.statusPengembalian !== 'DISETUJUI' &&
                      pengembalian.statusPengembalian !== 'DITOLAK' ? (
                      <IconButton onClick={(e) => pengembalian.id && handleMenuOpen(e, pengembalian.id)}>
                        <DotsThreeVertical />
                      </IconButton>
                    ) : /* Untuk User dan Mahasiswa, hanya tampil jika status belum disetujui/ditolak */
                    pengembalian.statusPengembalian !== 'DISETUJUI' && pengembalian.statusPengembalian !== 'DITOLAK' ? (
                      <IconButton onClick={(e) => pengembalian.id && handleMenuOpen(e, pengembalian.id)}>
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
          : user?.role === 'KALAB' && pengembalian.find((p) => p.id === selectedId)?.departemenId === user?.departemenId
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
              pengembalian.find((p) => p.id === selectedId)?.statusPengembalian !== 'DISETUJUI' &&
              pengembalian.find((p) => p.id === selectedId)?.statusPengembalian !== 'DITOLAK' && [
                <MenuItem key="edit" onClick={() => { handleEditClick(selectedId!); }}>
                  Edit
                </MenuItem>,
                <MenuItem key="delete" onClick={() => { handleDeleteClick(selectedId!); }}>
                  Delete
                </MenuItem>,
                /* Tambahkan opsi Update Status untuk Pengawas Lab */
                user?.role === 'PENGAWAS_LAB' &&
                  pengembalian.find((p) => p.id === selectedId)?.departemenId === user?.departemenId && (
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
