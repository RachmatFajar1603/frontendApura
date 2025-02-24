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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SkipBack } from '@phosphor-icons/react/dist/csr/SkipBack';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { CloudArrowUp } from '@phosphor-icons/react/dist/ssr/CloudArrowUp';
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
import { useCalendar } from '@/lib/pemrosesan/calendar';
import { usePeminjaman } from '@/lib/pemrosesan/peminjaman';
import { usePenyewaan } from '@/lib/pemrosesan/penyewaan';
import { useUsers } from '@/hooks/use-user';

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
  shift?: any;
  laboratorium?: any;
}

interface SelectedAssetWithQuantity extends AssetDetails {
  quantity: number;
  selectedFacilities?: string[];
}

function PeminjamanForm() {
  const router = useRouter();

  const [selectedAssetType, setSelectedAssetType] = useState<string>('');
  const [selectedAssets, setSelectedAssets] = useState<SelectedAssetWithQuantity[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<Record<string, string[]>>({});
  const [facilityQuantities, setFacilityQuantities] = useState<Record<string, number>>({});
  const [tujuan, setTujuan] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState<Dayjs | null>(null);
  const [tanggalSelesai, setTanggalSelesai] = useState<Dayjs | null>(null);
  const [ttdPeminjam, setTtdPeminjam] = useState<any>(null);

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
  const { postPeminjaman, peminjaman, error: postError } = usePeminjaman();
  const { calendarPeminjaman, calendarPenyewaan } = useCalendar();
  const { penyewaan } = usePenyewaan();
  const { user } = useUsers();
  const { fasilitas, getFasilitas } = useFasilitas();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = ['Pilih Jenis Aset', 'Pilih Aset', 'Detail Peminjaman'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

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

    if (selectedFacilities[roomId]?.includes(facilityId)) {
      setFacilityQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[facilityId];
        return newQuantities;
      });
    } else {
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
    const minBookingDate = dayjs().add(2, 'day');
    if (selectedDate.isBefore(minBookingDate, 'day')) {
      return true;
    }

    const peminjamanConflict = calendarPeminjaman.some((booking) => {
      if (booking.statusPengajuan === 'DITOLAK') return false;

      const relevantId = booking.ruangUmumId || booking.ruangLabId || booking.alatId;
      if (relevantId !== assetId) return false;

      const start = dayjs(booking.tanggalMulai);
      const end = dayjs(booking.tanggalSelesai);
      return selectedDate.isBetween(start, end, 'day', '[]');
    });

    const penyewaanConflict = calendarPenyewaan.some((booking) => {
      if (booking.statusPengajuan === 'DITOLAK') return false;

      const relevantId = booking.ruangUmumId || booking.ruangLabId || booking.alatId;
      if (relevantId !== assetId) return false;

      const start = dayjs(booking.tanggalMulai);
      const end = dayjs(booking.tanggalSelesai);
      return selectedDate.isBetween(start, end, 'day', '[]');
    });

    return peminjamanConflict || penyewaanConflict;
  };

  const handleDateChange = (date: Dayjs | null, isStartDate: boolean) => {
    if (!date || selectedAssets.length === 0) return;

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

  const handleRemoveFile = () => {
    setTtdPeminjam(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (selectedAssets.length === 0 || !tujuan || !tanggalMulai || !tanggalSelesai || !ttdPeminjam) {
      setErrorMessage('Harap isi semua field yang diperlukan');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
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
      let ttdPeminjamUrl = '';
      if (ttdPeminjam) {
        const formData = new FormData();
        formData.append('file', ttdPeminjam);
        const uploadResponse = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/uploadFile`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        ttdPeminjamUrl = uploadResponse.data?.content?.secure_url;
      }

      const peminjamanRequests = selectedAssets.map((asset) => {
        const basePeminjaman = {
          id: '',
          namaPeminjamId: user?.id || '',
          namaPenyetujuId: '',
          tujuan,
          jumlahYangDipinjam: selectedAssetType === 'alat' ? asset.quantity : 1,
          tanggalMulai: tanggalMulai.format('YYYY-MM-DD'),
          tanggalSelesai: tanggalSelesai.format('YYYY-MM-DD'),
          statusAset: '',
          statusPengajuan: '',
          departemenId: asset.departemenId,
          ttdPeminjam: ttdPeminjamUrl,
        };

        if (selectedAssetType === 'ruanganUmum') {
          const selectedFacilitiesForRoom = selectedFacilities[asset.id] || [];
          const facilityData = selectedFacilitiesForRoom.map((facilityId) => ({
            id: facilityId,
            jumlahDipinjam: facilityQuantities[facilityId] || 1,
          }));

          return {
            ...basePeminjaman,
            ruangUmumId: asset.id,
            fasilitasId: facilityData.length > 0 ? facilityData : undefined,
          };
        }
        return {
          ...basePeminjaman,
          [selectedAssetType === 'ruanganLab' ? 'ruangLabId' : 'alatId']: asset.id,
        };
      });

      await Promise.all(peminjamanRequests.map((request) => postPeminjaman(request)));

      setSuccessMessage('Peminjaman berhasil diajukan!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      router.push('/peminjaman');
    } catch (error) {
      console.error('Error saat mengajukan peminjaman:', error);
      setErrorMessage(
        `Error saat mengajukan peminjaman: ${(error as any).response?.data?.message || (error as any).message || 'Terjadi kesalahan'}`
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
                    {facility.kode} - Jumlah: {facility.jumlah} - Status:{' '}
                    {(facility.statusAset === 'TERSEDIA' ||
                      facility.statusAset === 'TIDAK_TERSEDIA' ||
                      facility.statusAset === 'SEDANG_DIPINJAM' ||
                      facility.statusAset === 'SEDANG_DISEWA' ||
                      facility.statusAset === 'SEDANG_DIPERBAIKI') && (
                      <Box
                        component="span"
                        sx={{
                          color:
                            facility.statusAset === 'TERSEDIA' ||
                            facility.statusAset === 'SEDANG_DIPINJAM' ||
                            facility.statusAset === 'SEDANG_DISEWA'
                              ? '#388e3c'
                              : facility.statusAset === 'SEDANG_DIPERBAIKI'
                                ? '#ed6c02' 
                                : '#d32f2f',
                          backgroundColor:
                            facility.statusAset === 'TERSEDIA' ||
                            facility.statusAset === 'SEDANG_DIPINJAM' ||
                            facility.statusAset === 'SEDANG_DISEWA'
                              ? '#e8f5e9'
                              : facility.statusAset === 'SEDANG_DIPERBAIKI'
                                ? '#fff3e0' 
                                : '#ffebee',
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
              {selectedAssetType === 'alat' && <TableCell>Nama Laboratorium</TableCell>}
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
            {assets?.map((asset) => {
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
                                : '#ff9800',
                          backgroundColor:
                            asset.statusAset === 'TERSEDIA'
                              ? '#e8f5e9'
                              : asset.statusAset === 'TIDAK_TERSEDIA'
                                ? '#ffebee'
                                : '#fff3e0',
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
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
              boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.06)',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              '& .MuiCardContent-root': {
                padding: { xs: '16px', sm: '24px', md: '32px' },
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
                    padding: '8px 16px',
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
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
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
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
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
                    minDate={dayjs().add(2, 'day')}
                    shouldDisableDate={(date) =>
                      date.isBefore(dayjs().add(2, 'day'), 'day') ||
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
                    minDate={tanggalMulai || dayjs().add(2, 'day')}
                    shouldDisableDate={(date) =>
                      date.isBefore(dayjs().add(2, 'day'), 'day') ||
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
                        : 'Sebelum upload, pastikan untuk menghapus latar belakang atau sensitivitas data. Maksimal size gambar 1MB.'}
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
                        {ttdPeminjam ? ttdPeminjam.name : 'Belum ada file yang diunggah'}
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          mt: 4,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            maxWidth: '1200px',
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
            maxWidth: '1200px',
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
              {isSubmitting ? 'Memproses...' : 'Ajukan Peminjaman'}
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

export default PeminjamanForm;
