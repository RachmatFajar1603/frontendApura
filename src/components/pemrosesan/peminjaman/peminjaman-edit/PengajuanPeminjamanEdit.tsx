'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Check, SkipBack, SkipForward } from '@phosphor-icons/react';
import { CloudArrowUp } from '@phosphor-icons/react/dist/ssr/CloudArrowUp';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import dayjs, { type Dayjs } from 'dayjs';

import api from '@/lib/api';
import { useAlat } from '@/lib/aset/alat/useAlat';
import { useRuanganLab } from '@/lib/aset/RuanganLab/useRuanganLab';
import { useRuanganUmum } from '@/lib/aset/RuanganUmum/useRuanganUmum';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useFasilitas } from '@/lib/fasilitas/fasilitas';
import { useGedung } from '@/lib/gedung/gedung';
import { usePeminjaman } from '@/lib/pemrosesan/peminjaman';
import { usePenyewaan } from '@/lib/pemrosesan/penyewaan';
import { useCalendar } from '@/lib/pemrosesan/calendar';

// import { useUsers } from '@/hooks/use-user';

interface AssetDetails {
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  jumlah: number;
  statusAset: string;
  shift?: any;
}

interface Peminjaman {
  id: any;
  namaPeminjamId?: string;
  namaPenyetujuId?: string;
  tujuan: string;
  jumlahYangDipinjam?: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusAset: string;
  statusPengajuan: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  departemenId?: string;
  fasilitas?: any;
  namaPeminjam?: any;
  namaPenyetuju?: any;
  shiftId?: any;
  fasilitasId?: any;
}

interface SelectedAssetWithQuantity extends AssetDetails {
  quantity: number;
  selectedFacilities?: string[];
}

const EditPeminjamanForm: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();

  const [pinjam, setPinjam] = useState<Peminjaman | null>(null);
  const [selectedAssetType, setSelectedAssetType] = useState<string>('');
  const [selectedAssets, setSelectedAssets] = useState<SelectedAssetWithQuantity[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<Record<string, string[]>>({});
  const [selectedFasilitas, setSelectedFasilitas] = useState<
    {
      id: string;
      jumlahDipinjam: number;
    }[]
  >([]);
  const [facilityQuantities, setFacilityQuantities] = useState<Record<string, number>>({});
  const [originalQuantities, setOriginalQuantities] = useState<Record<string, number>>({});
  const [tujuan, setTujuan] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState<Dayjs | null>(null);
  const [tanggalSelesai, setTanggalSelesai] = useState<Dayjs | null>(null);
  const [ttdPeminjam, setTtdPeminjam] = useState<any>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const [activeStep, setActiveStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const { ruanganUmum, loading: loadingRuanganUmum } = useRuanganUmum();
  const { ruanganLab, loading: loadingRuanganLab } = useRuanganLab();
  const { alat, loading: loadingAlat } = useAlat();
  const { departemen } = useDepartemen();
  const { gedung } = useGedung();
  const { getPeminjamanById, peminjaman, updatePeminjaman, error: updateError } = usePeminjaman();
  const { calendarPeminjaman, calendarPenyewaan } = useCalendar();
  const { penyewaan } = usePenyewaan();
  // const { user } = useUsers();
  const { fasilitas } = useFasilitas();

  const steps = ['Pilih Jenis Aset', 'Pilih Aset', 'Detail Peminjaman'];

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const peminjamanData = await getPeminjamanById(id as string);
        if (peminjamanData) {
          setPinjam(peminjamanData);
          setTujuan(peminjamanData.tujuan);
          setTanggalMulai(dayjs(peminjamanData.tanggalMulai));
          setTanggalSelesai(dayjs(peminjamanData.tanggalSelesai));
          setTtdPeminjam(peminjamanData.ttdPeminjam);

          if (peminjamanData.ruangUmumId) {
            setSelectedAssetType('ruanganUmum');

            // Initialize selected facilities from fasilitasPeminjaman
            if (peminjamanData.fasilitasPeminjaman && peminjamanData.fasilitasPeminjaman.length > 0) {
              const initialFasilitas = peminjamanData.fasilitasPeminjaman.map((fp: any) => ({
                id: fp.fasilitasId,
                jumlahDipinjam: fp.jumlahDipinjam,
              }));
              setSelectedFasilitas(initialFasilitas);
              const origQuantities: Record<string, number> = {};
              peminjamanData.fasilitasPeminjaman.forEach((fp: any) => {
                origQuantities[fp.fasilitasId] = fp.jumlahDipinjam;
              });
              setOriginalQuantities(origQuantities);
            }
          } else if (peminjamanData.ruangLabId) {
            setSelectedAssetType('ruanganLab');
          } else if (peminjamanData.alatId) {
            setSelectedAssetType('alat');
          }
        }
      }
    };

    fetchData();
  }, [id, getPeminjamanById]);

  useEffect(() => {
    if (pinjam && selectedAssetType) {
      let selectedAsset;
      const assetQuantity = pinjam.jumlahYangDipinjam;
      switch (selectedAssetType) {
        case 'ruanganUmum':
          selectedAsset = ruanganUmum.find((asset) => asset.id === pinjam.ruangUmumId);
          break;
        case 'ruanganLab':
          selectedAsset = ruanganLab.find((asset) => asset.id === pinjam.ruangLabId);
          break;
        case 'alat':
          selectedAsset = alat.find((asset) => asset.id === pinjam.alatId);
          break;
      }
      if (selectedAsset) {
        setSelectedAssets([{ ...selectedAsset, quantity: assetQuantity || 1 }]);
      }
    }
  }, [pinjam, selectedAssetType, ruanganUmum, ruanganLab, alat]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFacilityToggle = (roomId: string, facilityId: string) => {
    setSelectedFasilitas((prev) => {
      const exists = prev.find((f) => f.id === facilityId);

      if (exists) {
        // If unchecking, remove the facility
        return prev.filter((f) => f.id !== facilityId);
      }
      // Check facility status and availability
      const facility = fasilitas.find((f) => f.id === facilityId);
      if (
        facility &&
        (facility.jumlah <= 0 ||
          (facility.statusAset !== 'TERSEDIA' &&
            facility.statusAset !== 'SEDANG_DIPINJAM' &&
            facility.statusAset !== 'SEDANG_DISEWA'))
      ) {
        setErrorMessage('Hanya fasilitas dengan status TERSEDIA yang dapat dipilih.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return prev;
      }

      // If checking, add the facility with original quantity if it exists, or previous quantity, or default to 1
      const quantity = originalQuantities[facilityId] || prev.find((f) => f.id === facilityId)?.jumlahDipinjam || 1;

      return [...prev, { id: facilityId, jumlahDipinjam: quantity }];
    });
  };

  const handleFacilityQuantityChange = (facilityId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setSelectedFasilitas((prev) => prev.map((f) => (f.id === facilityId ? { ...f, jumlahDipinjam: quantity } : f)));
  };

  const handleAssetTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAssetType(event.target.value);
    setSelectedAssets([]);
    setSelectedFacilities({});
  };

  const handleAssetSelection = (asset: AssetDetails) => {
    // For edit mode, allow unselecting even if status is not TERSEDIA or jumlah is 0
    setSelectedAssets((prevSelectedAssets) => {
      const isSelected = prevSelectedAssets.some((selectedAsset) => selectedAsset.id === asset.id);

      // If already selected, always allow unselecting
      if (isSelected) {
        return prevSelectedAssets.filter((selectedAsset) => selectedAsset.id !== asset.id);
      }

      // For new selection, check availability
      if (asset.statusAset !== 'TERSEDIA' || asset.jumlah === 0) {
        setErrorMessage('Hanya aset dengan status TERSEDIA yang dapat dipilih.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return prevSelectedAssets;
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
    // Cek minimal pengajuan H-2
    const minBookingDate = dayjs().add(2, 'day');
    if (selectedDate.isBefore(minBookingDate, 'day')) {
      return true; // Mengembalikan true jika tanggal kurang dari H-2
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
      setTtdPeminjam(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTtdPeminjam(file);
    }
  };

  const extractFilename = (file: any) => {
    if (file instanceof File) {
      return file.name;
    }
    if (typeof file === 'string') {
      const parts = file.split('/');
      return parts[parts.length - 1];
    }
    return 'Belum ada file yang diunggah';
  };

  const handleRemoveFile = () => {
    setTtdPeminjam(null);

    // Reset input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!tujuan.trim() || !tanggalMulai || !tanggalSelesai || !ttdPeminjam || selectedAssets.length === 0) {
      setErrorMessage('Semua field yang diperlukan harus diisi.');
      setOpenSnackbar(true);
      setSnackbarSeverity('error');
      return;
    }

    if (!setTtdPeminjam) {
      setErrorMessage('Harap upload file tanda tangan');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload file tanda tangan terlebih dahulu
      let ttdPeminjamUrl = '';
      if (ttdPeminjam instanceof File) {
        const formData = new FormData();
        formData.append('file', ttdPeminjam);

        try {
          const uploadResponse = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/uploadFile`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (uploadResponse.data?.content?.secure_url) {
            ttdPeminjamUrl = uploadResponse.data.content.secure_url;
          } else {
            throw new Error('Upload response format is invalid');
          }
        } catch (uploadError: any) {
          console.error('File upload error:', uploadError);
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
      } else {
        ttdPeminjamUrl = ttdPeminjam;
      }

      // Prepare the updated peminjaman data
      const updatedPeminjaman: any = {
        tujuan,
        tanggalMulai: tanggalMulai.format('YYYY-MM-DD'),
        tanggalSelesai: tanggalSelesai.format('YYYY-MM-DD'),
        ttdPeminjam: ttdPeminjamUrl,
        jumlahYangDipinjam: selectedAssets.reduce((total, asset) => total + asset.quantity, 0),
        departemenId: selectedAssets[0]?.departemenId, // Add departemen ID
        fasilitasId: selectedFasilitas.length > 0 ? selectedFasilitas : undefined,
      };

      switch (selectedAssetType) {
        case 'ruanganUmum':
          updatedPeminjaman.ruangUmumId = selectedAssets[0]?.id;
          break;
        case 'ruanganLab':
          updatedPeminjaman.ruangLabId = selectedAssets[0]?.id;
          break;
        case 'alat':
          updatedPeminjaman.alatId = selectedAssets[0]?.id;
          break;
      }

      await updatePeminjaman(id as string, updatedPeminjaman);

      console.log('Peminjaman berhasil diperbarui:', updatedPeminjaman);

      setSuccessMessage('Peminjaman berhasil diperbarui!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      router.push('/peminjaman');
    } catch (error) {
      setErrorMessage(
        `Error saat memperbarui peminjaman: ${
          (error as any).response?.data?.message || (error as any).message || 'Terjadi kesalahan'
        }`
      );
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      console.error('Error saat memperbarui peminjaman:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFacilitiesList = (roomId: string) => {
    if (!fasilitas || fasilitas.length === 0) return null;

    return (
      <List dense>
        {fasilitas.map((facility) => {
          const selectedFacility = selectedFasilitas.find((f) => f.id === facility.id);
          const isChecked = Boolean(selectedFacility);
          const isDisabled =
            !isChecked &&
            (facility.jumlah <= 0 ||
              (facility.statusAset !== 'TERSEDIA' &&
                facility.statusAset !== 'SEDANG_DIPINJAM' &&
                facility.statusAset !== 'SEDANG_DISEWA'));
          const quantity = selectedFacility?.jumlahDipinjam || 0;

          return (
            <ListItem key={facility.id}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  disabled={isDisabled}
                  checked={isChecked}
                  onChange={() => {
                    handleFacilityToggle(roomId, facility.id);
                  }}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={facility.nama}
                secondary={
                  <>
                    {facility.kode} - Jumlah: {facility.jumlah} - Status:{' '}
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
                value={isChecked ? selectedFasilitas.find((f) => f.id === facility.id)?.jumlahDipinjam || 0 : 0}
                onChange={(e) => {
                  handleFacilityQuantityChange(facility.id, e.target.value);
                }}
                InputProps={{
                  inputProps: {
                    min: 1,
                    max: facility.jumlah,
                  },
                }}
                disabled={
                  !isChecked ||
                  (facility.statusAset !== 'TERSEDIA' &&
                    facility.statusAset !== 'SEDANG_DIPINJAM' &&
                    facility.statusAset !== 'SEDANG_DISEWA') ||
                  facility.jumlah <= 0
                }
                size="small"
                sx={{ width: 80, marginLeft: 2 }}
                onBlur={() => {
                  if (isChecked) {
                    setFacilityQuantities((prev) => ({
                      ...prev,
                      [facility.id]: selectedFasilitas.find((f) => f.id === facility.id)?.jumlahDipinjam || 0,
                    }));
                  }
                }}
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
        assets = ruanganUmum as AssetDetails[];
        break;
      case 'ruanganLab':
        assets = ruanganLab as AssetDetails[];
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
              <TableCell>Departemen</TableCell>
              <TableCell>Gedung</TableCell>
              <TableCell>Lantai</TableCell>
              <TableCell>Jumlah Tersedia</TableCell>
              {selectedAssetType === 'alat' && <TableCell>Quantity</TableCell>}
              <TableCell>Shift</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => {
              const selectedAsset = selectedAssets.find((selected) => selected.id === asset.id);
              const isSelected = Boolean(selectedAsset);
              const isDisabled = !isSelected && (asset.statusAset !== 'TERSEDIA' || asset.jumlah === 0);

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
                      <Radio
                        checked={isSelected}
                        onChange={() => {
                          // Jika asset sudah dipilih dan diklik lagi, hapus pilihan
                          if (isSelected) {
                            setSelectedAssets([]);
                          } else {
                            // Jika memilih asset baru, ganti dengan asset tersebut
                            setSelectedAssets([{ ...asset, quantity: 1, selectedFacilities: [] }]);
                          }
                        }}
                        disabled={isDisabled}
                      />
                    </TableCell>
                    <TableCell>{asset.kode}</TableCell>
                    <TableCell>{asset.nama}</TableCell>
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
                          disabled={!selectedAsset || asset.statusAset !== 'TERSEDIA' || asset.jumlah === 0}
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
                    <TableCell>
                      {asset.shift?.namaShift} <br />
                      {asset.shift?.jamMulai} - {asset.shift?.jamSelesai}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          color: asset.statusAset === 'TERSEDIA' ? '#388e3c' : '#d32f2f',
                          backgroundColor: asset.statusAset === 'TERSEDIA' ? '#e8f5e9' : '#ffebee',
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
                <FormControlLabel
                  value="ruanganUmum"
                  control={<Radio />}
                  label="Ruangan Umum"
                  disabled={selectedAssetType !== 'ruanganUmum'}
                />
                <FormControlLabel
                  value="ruanganLab"
                  control={<Radio />}
                  label="Ruangan Lab"
                  disabled={selectedAssetType !== 'ruanganLab'}
                />
                <FormControlLabel
                  value="alat"
                  control={<Radio />}
                  label="Alat"
                  disabled={selectedAssetType !== 'alat'}
                />
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
                Detail Peminjaman
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tujuan Peminjaman"
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
                        {ttdPeminjam ? extractFilename(ttdPeminjam) : 'Belum ada file yang diunggah'}
                      </Typography>
                      {ttdPeminjam ? (
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
      default:
        return null;
    }
  };

  if (!pinjam) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

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
              {isSubmitting ? 'Memproses...' : 'Update Peminjaman'}
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

        {updateError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {updateError}
          </Alert>
        ) : null}
      </Box>
    </LocalizationProvider>
  );
};

export default EditPeminjamanForm;
