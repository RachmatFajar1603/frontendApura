'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Collapse,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SkipBack } from '@phosphor-icons/react/dist/csr/SkipBack';
import { Bank } from '@phosphor-icons/react/dist/ssr/Bank';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { CloudArrowUp } from '@phosphor-icons/react/dist/ssr/CloudArrowUp';
import { Person } from '@phosphor-icons/react/dist/ssr/Person';
import { SkipForward } from '@phosphor-icons/react/dist/ssr/SkipForward';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import dayjs, { type Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import api from '@/lib/api';
import { useAlat } from '@/lib/aset/alat/useAlat';
import { useRuanganLab } from '@/lib/aset/RuanganLab/useRuanganLab';
import { useRuanganUmum } from '@/lib/aset/RuanganUmum/useRuanganUmum';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useFasilitas } from '@/lib/fasilitas/fasilitas';
import { useGedung } from '@/lib/gedung/gedung';
import { usePeminjaman } from '@/lib/pemrosesan/peminjaman';
import { usePenyewaan } from '@/lib/pemrosesan/penyewaan';
import { useUsers } from '@/hooks/use-user';
import { useCalendar } from '@/lib/pemrosesan/calendar';

dayjs.extend(isBetween);

interface AssetDetails {
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  jumlah: number;
  statusAset: string;
  harga: number;
  shift?: any;
  laboratorium?: any;
}

interface SelectedAssetWithQuantity extends AssetDetails {
  quantity: number;
  selectedFacilities?: string[];
}

function PenyewaanForm() {
  const router = useRouter();

  const [selectedAssetType, setSelectedAssetType] = useState<string>('');
  const [selectedAssets, setSelectedAssets] = useState<SelectedAssetWithQuantity[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<Record<string, string[]>>({});
  const [facilityQuantities, setFacilityQuantities] = useState<Record<string, number>>({});
  const [tujuan, setTujuan] = useState('');
  // const [jumlahYangDipinjam, setJumlahYangDipinjam] = useState(0);
  const [tanggalMulai, setTanggalMulai] = useState<Dayjs | null>(null);
  const [tanggalSelesai, setTanggalSelesai] = useState<Dayjs | null>(null);
  const [ttdPenyewa, setTtdPenyewa] = useState<any>(null);
  const [buktiPembayaran, setBuktiPembayaran] = useState<any>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const { getRuanganUmum, ruanganUmum, loading: loadingRuanganUmum } = useRuanganUmum();
  const { getRuanganLab, ruanganLab, loading: loadingRuanganLab } = useRuanganLab();
  const { getAlat, alat, loading: loadingAlat } = useAlat();
  const { departemen } = useDepartemen();
  const { gedung } = useGedung();
  const { postPenyewaan, penyewaan, loading: loadingPost, error: postError } = usePenyewaan();
  const { peminjaman } = usePeminjaman();
  const { calendarPeminjaman, calendarPenyewaan } = useCalendar();
  const { user } = useUsers();
  const { fasilitas, getFasilitas } = useFasilitas();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefBuktiPembayaran = useRef<HTMLInputElement>(null);

  const steps = ['Pilih Jenis Aset', 'Pilih Aset', 'Detail Penyewaan', 'Pembayaran'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const theme = useTheme();

  useEffect(() => {
    getRuanganUmum();
    getRuanganLab();
    getAlat();
    getFasilitas();
  }, [getRuanganUmum, getRuanganLab, getAlat, getFasilitas]);

  const handleFacilityToggle = (roomId: string, facilityId: string) => {
    setSelectedFacilities((prev) => {
      const roomFacilities = prev[roomId] || [];
      const newFacilities = roomFacilities.includes(facilityId)
        ? roomFacilities.filter((id) => id !== facilityId)
        : [...roomFacilities, facilityId];

      return {
        ...prev,
        [roomId]: newFacilities,
      };
    });

    // Reset quantity when unchecking
    if (selectedFacilities[roomId]?.includes(facilityId)) {
      setFacilityQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[facilityId];
        return newQuantities;
      });
    } else {
      // Set default quantity of 1 when checking
      setFacilityQuantities((prev) => ({
        ...prev,
        [facilityId]: 1,
      }));
    }
  };

  const handleFacilityQuantityChange = (roomId: string, facilityId: string, value: string) => {
    const facility = fasilitas.find((f) => f.id === facilityId);
    if (!facility) return;

    const quantity = parseInt(value) || 0;

    // Validate quantity cannot exceed available facilities or be negative
    const validQuantity = quantity > 0 ? Math.min(quantity, facility.jumlah) : 0;

    setFacilityQuantities((prev) => ({
      ...prev,
      [facilityId]: validQuantity,
    }));
  };

  const handleAssetTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAssetType(event.target.value);
    setSelectedAssets([]);
    setSelectedFacilities({});
  };

  const handleAssetSelection = (asset: AssetDetails) => {
    if (asset.statusAset !== 'TERSEDIA') {
      setErrorMessage('Hanya aset dengan status TERSEDIA yang dapat dipilih.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setSelectedAssets((prevSelectedAssets) => {
      const isSelected = prevSelectedAssets.some((selectedAsset) => selectedAsset.id === asset.id);
      if (isSelected) {
        return prevSelectedAssets.filter((selectedAsset) => selectedAsset.id !== asset.id);
      }
      return [...prevSelectedAssets, { ...asset, quantity: 1, selectedFacilities: [] }];
    });
  };

  const handleQuantityChange = (assetId: string, value: string) => {
    const quantity = parseInt(value) || 0;

    setSelectedAssets((prevSelectedAssets) =>
      prevSelectedAssets.map((asset) => {
        if (asset.id === assetId) {
          const maxQuantity = asset.jumlah;
          const validQuantity = Math.min(Math.max(1, quantity), maxQuantity);
          return { ...asset, quantity: validQuantity };
        }
        return asset;
      })
    );
  };

  const getDepartemenName = (departemenId: string) => {
    const foundDepartemen = departemen.find((d) => d.id === departemenId);
    return foundDepartemen ? foundDepartemen.nama : 'Unknown';
  };

  const getGedungName = (gedungId: string) => {
    const foundGedung = gedung.find((g) => g.id === gedungId);
    return foundGedung ? foundGedung.nama : 'Unknown';
  };

  const isDateConflict = (selectedDate: Dayjs, assetId: string) => {
    // Cek minimal pengajuan h-2
    const minBookingDate = dayjs().add(2, 'day');
    if (selectedDate.isBefore(minBookingDate, 'day')) {
      return true;
    }

    // Cek konflik dengan peminjaman yang ada
    const peminjamanConflict = calendarPeminjaman.some((booking) => {
      // Skip jika status ditolak
      if (booking.statusPengajuan === 'DITOLAK') return false;

      const relevantId = booking.ruangUmumId || booking.ruangLabId || booking.alatId;
      if (relevantId !== assetId) return false;

      const start = dayjs(booking.tanggalMulai);
      const end = dayjs(booking.tanggalSelesai);
      return selectedDate.isBetween(start, end, 'day', '[]');
    });

    // Cek konflik dengan penyewaan yang ada
    const penyewaanConflict = calendarPenyewaan.some((booking) => {
      // Skip jika status ditolak
      if (booking.statusPengajuan === 'DITOLAK') return false;

      const relevantId = booking.ruangUmumId || booking.ruangLabId || booking.alatId;
      if (relevantId !== assetId) return false;

      const start = dayjs(booking.tanggalMulai);
      const end = dayjs(booking.tanggalSelesai);
      return selectedDate.isBetween(start, end, 'day', '[]');
    });

    // Return true jika ada konflik baik di peminjaman atau penyewaan
    return peminjamanConflict || penyewaanConflict;
  };

  const handleDateChange = (date: Dayjs | null, isStartDate: boolean) => {
    if (!date || selectedAssets.length === 0) return;

    // Cek minimal pengajuan H-2
    const minBookingDate = dayjs().add(2, 'day');
    if (date.isBefore(minBookingDate, 'day')) {
      setErrorMessage('Pengajuan minimal H-2 sebelum tanggal yang diinginkan');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const hasConflict = selectedAssets.some((asset) => isDateConflict(date, asset.id));
    if (hasConflict) {
      setErrorMessage('Tanggal yang dipilih sudah dibooking untuk aset ini');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (isStartDate) {
      setTanggalMulai(date);
    } else {
      setTanggalSelesai(date);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      setTtdPenyewa(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTtdPenyewa(file);
    }
  };

  const handleRemoveFile = () => {
    setTtdPenyewa(null);

    // Reset input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChangeBuktiPembayaran = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBuktiPembayaran(file);
    }
  };

  const handleRemoveFileBuktiPembayaran = () => {
    setBuktiPembayaran(null);

    // Reset input file
    if (fileInputRefBuktiPembayaran.current) {
      fileInputRefBuktiPembayaran.current.value = '';
    }
  };

  function formatRupiahTabel(angka: any) {
    return `Rp ${angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (selectedAssets.length === 0 || !tujuan || !tanggalMulai || !tanggalSelesai || !ttdPenyewa || !buktiPembayaran) {
      setErrorMessage('Harap isi semua field yang diperlukan');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (!ttdPenyewa) {
      setErrorMessage('Harap unggah tanda tangan peminjam');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (!buktiPembayaran) {
      setErrorMessage('Harap unggah bukti pembayaran');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);
    try {
      let ttdPenyewaUrl = '';
      let buktiPembayaranUrl = '';

      // Upload Tanda Tangan
      if (ttdPenyewa) {
        const formData = new FormData();
        formData.append('file', ttdPenyewa);

        const uploadResponse = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/uploadFile`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadResponse.data?.content?.secure_url) {
          ttdPenyewaUrl = uploadResponse.data.content.secure_url;
        } else {
          throw new Error('Gagal mendapatkan URL tanda tangan');
        }
      }

      // Upload Bukti Pembayaran
      if (buktiPembayaran) {
        const formData = new FormData();
        formData.append('file', buktiPembayaran);

        const uploadResponse = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/uploadFile`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadResponse.data?.content?.secure_url) {
          buktiPembayaranUrl = uploadResponse.data.content.secure_url;
        } else {
          throw new Error('Gagal mendapatkan URL bukti pembayaran');
        }
      }

      const penyewaanRequests = selectedAssets.map((asset) => {
        const basePenyewaan = {
          id: '',
          namaPenyewaId: user ? user.id : '',
          namaPenyetujuSewaId: '',
          tujuan,
          jumlahYangDisewa: selectedAssetType === 'alat' ? asset.quantity : 1,
          tanggalMulai: tanggalMulai.format('YYYY-MM-DD'),
          tanggalSelesai: tanggalSelesai.format('YYYY-MM-DD'),
          statusAset: '',
          statusPengajuan: '',
          departemenId: asset.departemenId,
          ttdPenyewa: ttdPenyewaUrl,
          buktiPembayaran: buktiPembayaranUrl,
        };

        if (selectedAssetType === 'ruanganUmum') {
          const selectedFacilitiesForRoom = selectedFacilities[asset.id] || [];
          const facilityData = selectedFacilitiesForRoom.map((facilityId) => ({
            id: facilityId,
            jumlahDisewa: facilityQuantities[facilityId] || 1,
          }));

          return {
            ...basePenyewaan,
            ruangUmumId: asset.id,
            fasilitasId: facilityData.length > 0 ? facilityData : undefined,
          };
        }
        return {
          ...basePenyewaan,
          [selectedAssetType === 'ruanganLab' ? 'ruangLabId' : 'alatId']: asset.id,
        };
      });

      await Promise.all(penyewaanRequests.map((penyewaan) => postPenyewaan(penyewaan)));

      setSuccessMessage('Semua penyewaan berhasil diajukan!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      // Reset form
      setSelectedAssetType('');
      setSelectedAssets([]);
      setSelectedFacilities({});
      setTujuan('');
      setTanggalMulai(null);
      setTanggalSelesai(null);
      setActiveStep(0);
      router.push('/penyewaan');
    } catch (error) {
      console.error('Error saat mengajukan penyewaan:', error);
      setErrorMessage(
        `Error saat mengajukan penyewaan: ${
          (error as any).response?.data?.message || (error as any).message || 'Terjadi kesalahan'
        }`
      );
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFacilitiesList = (roomId: string) => {
    if (!fasilitas || fasilitas.length === 0) return null;

    return (
      <List dense>
        {fasilitas.map((facility) => {
          const isDisabled =
            facility.jumlah <= 0 ||
            (facility.statusAset !== 'TERSEDIA' &&
              facility.statusAset !== 'SEDANG_DIPINJAM' &&
              facility.statusAset !== 'SEDANG_DISEWA');

          const isChecked = selectedFacilities[roomId]?.includes(facility.id) || false;

          return (
            <ListItem key={facility.id} disabled={isDisabled}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  disabled={isDisabled}
                  checked={isChecked}
                  onChange={() => !isDisabled && handleFacilityToggle(roomId, facility.id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={facility.nama}
                secondary={
                  <>
                    {facility.kode} - Harga: {formatRupiahTabel(facility?.harga)} - Jumlah: {facility.jumlah} - Status:{' '}
                    {(facility.statusAset === 'TERSEDIA' ||
                      facility.statusAset === 'TIDAK_TERSEDIA' ||
                      facility.statusAset === 'SEDANG_DIPINJAM' ||
                      facility.statusAset === 'SEDANG_DISEWA') && (
                      <Box
                        component="span"
                        sx={{
                          color:
                            facility.statusAset === 'TERSEDIA' ||
                            facility.statusAset === 'SEDANG_DIPINJAM' ||
                            facility.statusAset === 'SEDANG_DISEWA'
                              ? '#388e3c'
                              : '#d32f2f', // Hijau untuk TERSEDIA, SEDANG_DIPINJAM, dan SEDANG_DISEWA; Merah untuk TIDAK TERSEDIA
                          backgroundColor:
                            facility.statusAset === 'TERSEDIA' ||
                            facility.statusAset === 'SEDANG_DIPINJAM' ||
                            facility.statusAset === 'SEDANG_DISEWA'
                              ? '#e8f5e9'
                              : '#ffebee', // Latar belakang hijau muda untuk TERSEDIA, SEDANG_DIPINJAM, dan SEDANG_DISEWA; merah muda untuk TIDAK TERSEDIA
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {facility.statusAset === 'SEDANG_DIPINJAM' || facility.statusAset === 'SEDANG_DISEWA'
                          ? 'TERSEDIA'
                          : facility.statusAset}
                      </Box>
                    )}
                  </>
                }
              />
              <TextField
                type="number"
                value={isChecked ? facilityQuantities[facility.id] || '' : ''}
                onChange={(e) => {
                  handleFacilityQuantityChange(roomId, facility.id, e.target.value);
                }}
                InputProps={{
                  inputProps: {
                    min: 1,
                    max: facility.jumlah,
                  },
                }}
                disabled={!isChecked || isDisabled}
                size="small"
                sx={{ width: 80, marginLeft: 2 }}
              />
            </ListItem>
          );
        })}
      </List>
    );
  };

  const renderAssetList = () => {
    let assets: AssetDetails[] = [];
    switch (selectedAssetType) {
      case 'ruanganUmum':
        assets = ruanganUmum.map((ruangan) => ({
          ...ruangan,
          harga: Number(ruangan.harga),
        })) as AssetDetails[];
        break;
      case 'ruanganLab':
        assets = ruanganLab.map((ruangan) => ({
          ...ruangan,
          harga: Number(ruangan.harga),
        })) as AssetDetails[];
        break;
      case 'alat':
        assets = alat as AssetDetails[];
        break;
    }

    return (
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 400,
          overflow: 'auto',
          borderRadius: '8px',
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: 0,
          },
          '& .MuiTableHead-root': {
            backgroundColor: '#f8fafc',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            fontWeight: 600,
            borderBottom: '2px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiTableRow-root': {
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
          },
          '& .MuiTableCell-root': {
            borderBottom: '1px solid rgba(224, 224, 224, 0.8)',
            padding: '12px 16px',
          },
          '& .MuiCollapse-root': {
            backgroundColor: '#fafafa',
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Kode</TableCell>
              <TableCell>Nama</TableCell>
              {selectedAssetType === 'alat' && <TableCell>Nama Laboratorium</TableCell>}
              <TableCell>Departemen</TableCell>
              <TableCell>Gedung</TableCell>
              <TableCell>Lantai</TableCell>
              <TableCell>Jumlah Tersedia</TableCell>
              {selectedAssetType === 'alat' && <TableCell>Quantity</TableCell>}
              <TableCell>Harga</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => {
              const selectedAsset = selectedAssets.find((selected) => selected.id === asset.id);
              const isSelected = Boolean(selectedAsset);
              return (
                <React.Fragment key={asset.id}>
                  <TableRow
                    sx={{
                      backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.04)' : 'inherit',
                      '&:hover': {
                        backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {
                          handleAssetSelection(asset);
                        }}
                        disabled={asset.statusAset !== 'TERSEDIA' || asset.jumlah === 0}
                      />
                    </TableCell>
                    <TableCell>{asset.kode}</TableCell>
                    <TableCell>{asset.nama}</TableCell>
                    {selectedAssetType === 'alat' && <TableCell>{asset.laboratorium}</TableCell>}
                    <TableCell>{getDepartemenName(asset.departemenId)}</TableCell>
                    <TableCell>{getGedungName(asset.gedungId)}</TableCell>
                    <TableCell>{asset.lantai}</TableCell>
                    <TableCell>{asset.jumlah}</TableCell>
                    {selectedAssetType === 'alat' && (
                      <TableCell>
                        <TextField
                          type="number"
                          value={selectedAsset?.quantity || ''}
                          onChange={(e) => {
                            handleQuantityChange(asset.id, e.target.value);
                          }}
                          disabled={!selectedAsset}
                          InputProps={{
                            inputProps: {
                              min: 1,
                              max: asset.jumlah,
                            },
                          }}
                          size="small"
                          sx={{
                            width: 80,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                            },
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell>Rp. {asset.harga.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {asset.shift?.namaShift}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {asset.shift?.jamMulai} - {asset.shift?.jamSelesai}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          color:
                            asset.statusAset === 'TERSEDIA'
                              ? '#388e3c'
                              : asset.statusAset === 'TIDAK_TERSEDIA'
                                ? '#d32f2f'
                                : 'gray',
                          backgroundColor:
                            asset.statusAset === 'TERSEDIA'
                              ? '#e8f5e9'
                              : asset.statusAset === 'TIDAK_TERSEDIA'
                                ? '#ffebee'
                                : '#f5f5f5',
                        }}
                      >
                        {asset.statusAset}
                      </Box>
                    </TableCell>
                  </TableRow>
                  {selectedAssetType === 'ruanganUmum' && isSelected ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Collapse in={isSelected}>
                          <Box
                            sx={{
                              margin: 1,
                              padding: 2,
                              backgroundColor: '#fafafa',
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 600 }}>
                              Pilih Fasilitas
                            </Typography>
                            {renderFacilitiesList(asset.id)}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card
            sx={{
              height: '100%',
              width: '100%', // Added full width
              maxWidth: '1200px', // Increased max width
              margin: '0 auto', // Center the card
              boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.06)',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              '& .MuiCardContent-root': {
                padding: { xs: '16px', sm: '24px', md: '32px' }, // Responsive padding
              },
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Pilih Jenis Aset
              </Typography>
              <RadioGroup
                aria-label="jenis-aset"
                name="jenis-aset"
                value={selectedAssetType}
                onChange={handleAssetTypeChange}
                sx={{
                  '& .MuiFormControlLabel-root': {
                    marginY: 1,
                    padding: '8px 16px', // Added padding for better touch targets
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 1,
                    },
                  },
                }}
              >
                <FormControlLabel value="ruanganUmum" control={<Radio />} label="Ruangan Umum" />
                <FormControlLabel value="ruanganLab" control={<Radio />} label="Ruangan Lab" />
                <FormControlLabel value="alat" control={<Radio />} label="Alat" />
              </RadioGroup>
            </CardContent>
          </Card>
        );
      case 1:
        return (
          <Card
            sx={{
              height: '100%',
              width: '100%', // Added full width
              maxWidth: '1200px', // Increased max width
              margin: '0 auto', // Center the card
              boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.06)',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
            }}
          >
            <CardContent sx={{ padding: { xs: '16px', sm: '24px', md: '32px' } }}>
              <Typography variant="h5" gutterBottom>
                Pilih Aset
              </Typography>
              {loadingRuanganUmum || loadingRuanganLab || loadingAlat ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                  <CircularProgress />
                </Box>
              ) : (
                selectedAssetType && renderAssetList()
              )}
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card
            sx={{
              height: '100%',
              width: '100%', // Added full width
              maxWidth: '1200px', // Increased max width
              margin: '0 auto', // Center the card
              boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.06)',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
            }}
          >
            <CardContent sx={{ padding: { xs: '16px', sm: '24px', md: '32px' } }}>
              <Typography variant="h5" gutterBottom>
                Detail Penyewaan
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tujuan Penyewaan"
                    multiline
                    rows={4}
                    value={tujuan}
                    onChange={(e) => {
                      setTujuan(e.target.value);
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Tanggal Mulai"
                    value={tanggalMulai}
                    onChange={(newValue) => {
                      handleDateChange(newValue, true);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          backgroundColor: '#ffffff',
                        },
                      },
                    }}
                    minDate={dayjs().add(2, 'day')} // Ubah minDate menjadi H-2
                    shouldDisableDate={(date) =>
                      date.isBefore(dayjs().add(2, 'day'), 'day') || // Disable hari kurang dari H-2
                      selectedAssets.some((asset) => isDateConflict(date, asset.id))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Tanggal Selesai"
                    value={tanggalSelesai}
                    onChange={(newValue) => {
                      handleDateChange(newValue, false);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          backgroundColor: '#ffffff',
                        },
                      },
                    }}
                    minDate={tanggalMulai || dayjs().add(2, 'day')} // Ubah minDate menjadi H-2
                    shouldDisableDate={(date) =>
                      date.isBefore(dayjs().add(2, 'day'), 'day') || // Disable hari kurang dari H-2
                      selectedAssets.some((asset) => isDateConflict(date, asset.id))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                      border: '2px dashed',
                      borderColor: dragOver ? 'primary.main' : 'grey.300',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: dragOver ? 'rgba(0,0,0,0.02)' : '#ffffff',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.light',
                        backgroundColor: 'rgba(0,0,0,0.01)',
                      },
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/gif,application/pdf"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="raised-button-file">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudArrowUp />}
                        sx={{
                          mb: 2,
                          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
                          '&:hover': {
                            boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.15)',
                          },
                        }}
                      >
                        Upload Tanda Tangan
                      </Button>
                    </label>
                    <Typography variant="caption" display="block" gutterBottom sx={{ color: 'text.secondary' }}>
                      {dragOver
                        ? 'Lepaskan file di sini'
                        : 'Sebelum upload, pastikan untuk menghapus latar belakang atau sensitivitas data.'}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {ttdPenyewa ? ttdPenyewa.name : 'Belum ada file yang diunggah'}
                      </Typography>
                      {ttdPenyewa ? (
                        <Button
                          color="error"
                          size="small"
                          onClick={handleRemoveFile}
                          startIcon={<Trash />}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.04)',
                            },
                          }}
                        >
                          Hapus
                        </Button>
                      ) : null}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card
            sx={{
              height: '100%',
              width: '100%', // Added full width
              maxWidth: '1200px', // Increased max width
              margin: '0 auto', // Center the card
              boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.06)',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
            }}
          >
            <CardContent sx={{ padding: { xs: '16px', sm: '24px', md: '32px' } }}>
              <Typography variant="h5" gutterBottom>
                Konfirmasi Pembayaran
              </Typography>

              {/* Payment Information Section */}
              <Box
                sx={{
                  mb: 3,
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative background element */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    bgcolor: 'primary.light',
                    transform: 'rotate(45deg)',
                    opacity: 0.1,
                    zIndex: 1,
                  }}
                />

                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    mb: 2,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  <Bank style={{ marginRight: 16, color: 'primary.main' }} />
                  Informasi Rekening Pembayaran
                </Typography>

                <Grid container spacing={2}>
                  {/* Bank Information */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Bank
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        Bank Mandiri
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Account Number */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Nomor Rekening
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        1234 5678 9012
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Account Name */}
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ mr: 2, color: 'text.secondary' }}>
                        <Person />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Atas Nama
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          Universitas Contoh
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Asset Details */}
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ mb: 2 }}>
                          Detail Aset yang Disewa
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
                          Jumlah x Harga / Hari
                        </Typography>
                      </Box>
                      {selectedAssets.map((asset) => (
                        <React.Fragment key={asset.id}>
                          {/* Main Asset */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 1,
                              borderBottom: '1px solid',
                              borderColor: 'primary.main',
                              pb: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {asset.nama}
                            </Typography>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2">
                                {asset.quantity} x {formatRupiah(asset.harga)} / hari
                              </Typography>
                              <Typography variant="body2" color="primary.dark" fontWeight="bold">
                                Total: {formatRupiah(asset.quantity * asset.harga)}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Facilities for Room */}
                          {selectedAssetType === 'ruanganUmum' && selectedFacilities[asset.id] ? (
                            <Box sx={{ ml: 3, mt: 1, mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Fasilitas yang Disewa:
                              </Typography>
                              {selectedFacilities[asset.id].map((facilityId) => {
                                const facility = fasilitas.find((f) => f.id === facilityId);
                                const quantity = facilityQuantities[facilityId] || 1;
                                if (!facility) return null;

                                return (
                                  <Box
                                    key={facilityId}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      ml: 2,
                                      borderBottom: '1px dashed',
                                      borderColor: 'grey.300',
                                      pb: 0.5,
                                      mb: 0.5,
                                    }}
                                  >
                                    <Typography variant="body2">{facility.nama}</Typography>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant="body2">
                                        {quantity} x {formatRupiah(facility.harga || 0)} / hari
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Total: {formatRupiah(quantity * (facility.harga || 0))}
                                      </Typography>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
                          ) : null}
                        </React.Fragment>
                      ))}

                      {/* Total Calculation including facilities */}
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: '2px solid',
                          borderColor: 'primary.main',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Total Biaya
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {formatRupiah(
                            selectedAssets.reduce((total, asset) => {
                              // Hitung biaya aset utama
                              let assetTotal = asset.quantity * asset.harga;

                              // Tambahkan biaya fasilitas jika ada
                              if (selectedAssetType === 'ruanganUmum' && selectedFacilities[asset.id]) {
                                const facilitiesTotal = selectedFacilities[asset.id].reduce((facTotal, facilityId) => {
                                  const facility = fasilitas.find((f) => f.id === facilityId);
                                  const quantity = facilityQuantities[facilityId] || 1;
                                  return facTotal + (facility ? quantity * (facility.harga || 0) : 0);
                                }, 0);
                                assetTotal += facilitiesTotal;
                              }

                              return total + assetTotal;
                            }, 0)
                          )}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Payment Proof Upload Section */}
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  border: '2px dashed',
                  borderColor: dragOver ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: dragOver ? 'rgba(0,0,0,0.02)' : '#ffffff',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    backgroundColor: 'rgba(0,0,0,0.01)',
                  },
                }}
              >
                <input
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,application/pdf"
                  style={{ display: 'none' }}
                  id="payment-proof-file"
                  type="file"
                  onChange={handleFileChangeBuktiPembayaran}
                />
                <label htmlFor="payment-proof-file">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudArrowUp />}
                    sx={{
                      mb: 2,
                      boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    Upload Bukti Pembayaran
                  </Button>
                </label>

                <Typography variant="caption" display="block" gutterBottom sx={{ color: 'text.secondary' }}>
                  {dragOver
                    ? 'Lepaskan file di sini'
                    : 'Unggah bukti pembayaran (struk/transfer) dalam format JPG, PNG, atau PDF'}
                </Typography>

                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">
                    {buktiPembayaran ? buktiPembayaran.name : 'Belum ada bukti pembayaran'}
                  </Typography>

                  {buktiPembayaran ? (
                    <Button
                      color="error"
                      size="small"
                      onClick={handleRemoveFileBuktiPembayaran}
                      startIcon={<Trash />}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.04)',
                        },
                      }}
                    >
                      Hapus
                    </Button>
                  ) : null}
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px', // Increased max width
          mx: 'auto',
          mt: 4,
          px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        }}
      >
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            maxWidth: '1200px', // Match card width
            margin: '0 auto',
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400, mb: 4 }}>{renderStepContent(activeStep)}</Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 1 },
            mt: 3,
            width: '100%',
            maxWidth: '1200px', // Match card width
            margin: '0 auto',
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<SkipBack />}
            sx={{
              flex: { xs: '1', sm: '1 1 auto' },
              minWidth: { xs: '100%', sm: '120px' },
              bgcolor: 'secondary.main',
              '&:hover': {
                bgcolor: 'secondary.dark',
              },
            }}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              endIcon={isSubmitting ? <CircularProgress size={20} /> : <Check />}
              sx={{
                flex: { xs: '1', sm: '1 1 auto' },
                minWidth: { xs: '100%', sm: '180px' },
              }}
            >
              {loadingPost ? 'Memproses...' : 'Ajukan Penyewaan'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<SkipForward />}
              sx={{
                flex: { xs: '1', sm: '1 1 auto' },
                minWidth: { xs: '100%', sm: '120px' },
              }}
            >
              Next
            </Button>
          )}
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => {
            setOpenSnackbar(false);
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => {
              setOpenSnackbar(false);
            }}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarSeverity === 'success' ? successMessage : errorMessage}
          </Alert>
        </Snackbar>

        {postError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {postError}
          </Alert>
        ) : null}
      </Box>
    </LocalizationProvider>
  );
}

export default PenyewaanForm;
