'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
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
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { SkipForward } from '@phosphor-icons/react/dist/ssr/SkipForward';
import dayjs, { type Dayjs } from 'dayjs';

import { useDepartemen } from '@/lib/departemen/departemen';
import { type Fasilitas, useFasilitas } from '@/lib/fasilitas/fasilitas';
import { usePeminjaman } from '@/lib/pemrosesan/peminjaman';
import { usePengembalian } from '@/lib/pemrosesan/pengembalian';
import { usePenyewaan } from '@/lib/pemrosesan/penyewaan';
import { useUsers } from '@/hooks/use-user';

interface AssetDetails {
  id: string;
  namaPeminjam?: any;
  namaPenyewa?: any;
  namaPenyetuju?: any;
  tujuan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  RuanganUmum?: {
    nama: string;
    shift?: {
      namaShift: string;
      jamMulai: string;
      jamSelesai: string;
    };
  };
  RuangLab?: {
    nama: string;
    shift?: {
      namaShift: string;
      jamMulai: string;
      jamSelesai: string;
    };
  };
  Alat?: {
    nama: string;
    shift?: {
      namaShift: string;
      jamMulai: string;
      jamSelesai: string;
    };
  };
  statusAset: string;
  statusPengajuan: string;
  Fasilitas?: { nama: string };
  Departemen?: any;
  jumlahYangDipinjam?: any;
  jumlahYangDisewa?: any;
  totalBiaya?: any;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: string;
  penyewaanId?: string;
  peminjamanId?: string;
  departemenId?: string;
  Peminjaman?: any;
  Penyewaan?: any;
  fasilitasPeminjaman?: any;
  fasilitasPenyewaan?: any;
}

interface FacilitySelection {
  id: string;
  kondisiAset: 'BAIK' | 'RUSAK' | 'HILANG';
}

function PengembalianForm() {
  const router = useRouter();

  const [selectedAssetType, setSelectedAssetType] = useState<string>('');
  const [selectedAssets, setSelectedAssets] = useState<AssetDetails[]>([]);
  const [tujuan, setTujuan] = useState('');
  const [tanggalPengembalian, setTanggalPengembalian] = useState<Dayjs | null>(null);
  const [jumlahYangDikembalikan, setJumlahYangDikembalikan] = useState<number | null>(null);
  const [denda, setDenda] = useState<number | null>(null);
  const [kondisiAset, setKondisiAset] = useState<string | null>(null);
  const [deskripsiKerusakan, setDeskripsiKerusakan] = useState<string | null>(null);
  const { fasilitas, loading: fasilitasLoading } = useFasilitas();
  const [selectedFacilities, setSelectedFacilities] = useState<FacilitySelection[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Fasilitas[]>([]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeStep, setActiveStep] = useState(0);

  const { getPeminjaman, peminjaman, loading: loadingPeminjaman } = usePeminjaman();
  const { getPenyewaan, penyewaan, loading: loadingPenyewaan } = usePenyewaan();
  const { postPengembalian, error: postError } = usePengembalian();
  // const { user } = useUsers();
  const { departemen } = useDepartemen();

  const steps = ['Pilih Jenis Pemrosesan', 'Pilih Aset', 'Detail Pengembalian'];

  useEffect(() => {
    if (selectedAssets.length > 0) {
      const currentAsset = selectedAssets[0];
      let assetFacilities: any[] = [];

      // Get facilities based on asset type
      if (selectedAssetType === 'peminjaman' && currentAsset.fasilitasPeminjaman) {
        assetFacilities = currentAsset.fasilitasPeminjaman.map((fp: any) => ({
          id: fp.fasilitas.id,
          nama: fp.fasilitas.nama,
          kode: fp.fasilitas.kode,
          jumlah: fp.jumlahDipinjam,
        }));
      } else if (selectedAssetType === 'penyewaan' && currentAsset.fasilitasPenyewaan) {
        assetFacilities = currentAsset.fasilitasPenyewaan.map((fp: any) => ({
          id: fp.fasilitas.id,
          nama: fp.fasilitas.nama,
          kode: fp.fasilitas.kode,
          jumlah: fp.jumlahDisewa,
        }));
      }

      // Set the filtered facilities
      setFilteredFacilities(assetFacilities);
    } else {
      setFilteredFacilities([]);
    }
  }, [selectedAssets, selectedAssetType]);

  const handleFacilityChange = (facility: Fasilitas) => {
    setSelectedFacilities((prev) => {
      const existingIndex = prev.findIndex((f) => f.id === facility.id);
      if (existingIndex >= 0) {
        // Remove facility if already selected
        return prev.filter((f) => f.id !== facility.id);
      } 
        // Add facility with default condition
        return [...prev, { id: facility.id, kondisiAset: 'BAIK' }];
      
    });
  };

  const handleConditionChange = (facilityId: string, condition: 'BAIK' | 'RUSAK' | 'HILANG') => {
    setSelectedFacilities((prev) => prev.map((f) => (f.id === facilityId ? { ...f, kondisiAset: condition } : f)));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    getPeminjaman();
    getPenyewaan();
  }, [getPeminjaman, getPenyewaan]);

  const handleAssetTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAssetType(event.target.value);
    setSelectedAssets([]);
  };

  const handleAssetSelection = (asset: AssetDetails) => {
    setSelectedAssets([asset]);
  };

  const getPengajuanName = (pengajuan: AssetDetails) => {
    if (selectedAssetType === 'peminjaman') {
      return pengajuan.namaPeminjam?.namaLengkap;
    } else if (selectedAssetType === 'penyewaan') {
      return pengajuan.namaPenyewa?.namaLengkap;
    } 
      return 'Unknown';
    
  };

  const getShiftName = (pengembalian: AssetDetails) => {
    const shift = pengembalian.ruangUmumId
      ? pengembalian.RuanganUmum?.shift
      : pengembalian.ruangLabId
        ? pengembalian.RuangLab?.shift
        : pengembalian.alatId
          ? pengembalian.Alat?.shift
          : null;

    if (shift) {
      return `${shift.namaShift} (${shift.jamMulai} - ${shift.jamSelesai})`;
    }

    return '-';
  };

  const getAsetName = (pengembalian: AssetDetails) => {
    return pengembalian.ruangUmumId
      ? pengembalian.RuanganUmum?.nama
      : pengembalian.ruangLabId
        ? pengembalian.RuangLab?.nama
        : pengembalian.alatId
          ? pengembalian.Alat?.nama
          : pengembalian.fasilitasId
            ? pengembalian.Fasilitas?.nama
            : 'Unknown';
  };

  const getDepartemenName = (departemenId: string) => {
    const foundDepartemen = departemen.find((d) => d.id === departemenId);
    return foundDepartemen ? foundDepartemen.nama : 'Unknown';
  };

  const jumlahYangDiajukan = (pengembalian: AssetDetails) => {
    return pengembalian.jumlahYangDipinjam || pengembalian.jumlahYangDisewa || 0;
  };

  const handleSubmit = async () => {
    // Pastikan semua field yang wajib diisi sudah lengkap
    if (!tanggalPengembalian || !kondisiAset || selectedAssets.length === 0 || !tujuan.trim()) {
      setErrorMessage('Harap isi semua field yang diperlukan');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const selectedAsset = selectedAssets[0];
    const hasFacilities = selectedAsset.fasilitasId && selectedAsset.fasilitasId.length > 0;
    if (hasFacilities && selectedFacilities.length === 0) {
      setErrorMessage('Pilih fasilitas');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const tanggalSelesai = dayjs(selectedAsset.tanggalSelesai);
    const maxReturnDate = tanggalSelesai.add(1, 'day');
    if (!selectedAssets.length) return;

    // Validasi apakah tanggal pengembalian adalah tanggal selesai atau H+1
    if (!tanggalPengembalian.isSame(tanggalSelesai, 'day') && !tanggalPengembalian.isSame(maxReturnDate, 'day')) {
      setErrorMessage('Tanggal pengembalian harus pada tanggal selesai atau maksimal H+1');
      setOpenSnackbar(true);
      setIsSubmitting(false);
      return;
    }

    // Validasi kondisi aset jika rusak atau hilang
    if ((kondisiAset === 'RUSAK' || kondisiAset === 'HILANG') && !deskripsiKerusakan) {
      setErrorMessage('Please provide a description for the damage or loss.');
      setOpenSnackbar(true);
      setIsSubmitting(false);
      return;
    }

    // Persiapkan data untuk dikirim ke API
    const formData = {
      id: '',
      tujuan: tujuan.trim(),
      tanggalPengembalian: tanggalPengembalian.format('YYYY-MM-DD'),
      denda: denda ?? null,
      kondisiAset,
      deskripsiKerusakan: deskripsiKerusakan?.trim() ?? '',
      peminjamanId: selectedAssetType === 'peminjaman' ? selectedAssets[0].id : undefined,
      penyewaanId: selectedAssetType === 'penyewaan' ? selectedAssets[0].id : undefined,
      departemenId: selectedAssets[0].departemenId,
      alatId: selectedAssets[0].alatId,
      fasilitasId: selectedFacilities,
      ruangLabId: selectedAssets[0].ruangLabId,
      ruangUmumId: selectedAssets[0].ruangUmumId,
    };

    try {
      const response = await postPengembalian(formData);
      if (response) {
        setSuccessMessage('Pengembalian berhasil diajukan!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        router.push('/pengembalian');
      } else {
        throw new Error('Failed to submit the return, please try again.');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'An error occurred, please try again.');
      } else {
        setErrorMessage('An error occurred, please try again.');
      }
      setOpenSnackbar(true);
      setSnackbarSeverity('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to reset form to initial state
  const resetForm = () => {
    setActiveStep(0);
    setSelectedAssetType('');
    setSelectedAssets([]);
    setTujuan('');
    setTanggalPengembalian(null);
    setJumlahYangDikembalikan(null);
    setDenda(null);
    setKondisiAset(null);
    setDeskripsiKerusakan('');
  };

  const renderFacilitySection = () => {
    if (!selectedAssets.length) {
      return null;
    }

    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Fasilitas Ruangan
        </Typography>

        {fasilitasLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : filteredFacilities.length === 0 ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            Tidak ada fasilitas yang perlu dikembalikan
          </Alert>
        ) : (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredFacilities.map((facility) => (
                <Paper
                  key={facility.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFacilities.some((f) => f.id === facility.id)}
                        onChange={() => { handleFacilityChange(facility); }}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {facility.nama}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Kode: {facility.kode} | Jumlah: {facility.jumlah}
                        </Typography>
                      </Box>
                    }
                  />

                  {selectedFacilities.some((f) => f.id === facility.id) && (
                    <Box sx={{ mt: 2, ml: 4 }}>
                      <TextField
                        select
                        size="small"
                        label="Kondisi Fasilitas"
                        value={selectedFacilities.find((f) => f.id === facility.id)?.kondisiAset || 'BAIK'}
                        onChange={(e) =>
                          { handleConditionChange(facility.id, e.target.value as 'BAIK' | 'RUSAK' | 'HILANG'); }
                        }
                        sx={{ minWidth: 200 }}
                      >
                        <MenuItem value="BAIK">BAIK</MenuItem>
                        <MenuItem value="RUSAK">RUSAK</MenuItem>
                        <MenuItem value="HILANG">HILANG</MenuItem>
                      </TextField>
                    </Box>
                  )}
                </Paper>
              ))}
              <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                ⚠ Perhatian: Fasilitas yang dikembalikan wajib dalam kondisi baik dan lengkap sesuai dengan jumlah yang
                dipinjam dan disewa. Pengembalian yang tidak memenuhi syarat akan dikenakan sanksi sesuai ketentuan yang
                berlaku.
              </Typography>
            </Box>
          </FormControl>
        )}
      </Paper>
    );
  };

  const renderAssetList = () => {
    let assets: AssetDetails[] = [];
    switch (selectedAssetType) {
      case 'peminjaman':
        assets = peminjaman as AssetDetails[];
        break;
      case 'penyewaan':
        assets = penyewaan as AssetDetails[];
        break;
      default:
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
              <TableCell>Nama Pengajuan</TableCell>
              <TableCell>Nama Penyetuju</TableCell>
              <TableCell>Tujuan</TableCell>
              <TableCell>Status Aset</TableCell>
              <TableCell>Status Pengajuan</TableCell>
              <TableCell>Tanggal Mulai</TableCell>
              <TableCell>Tanggal Selesai</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Aset</TableCell>
              <TableCell>Fasilitas</TableCell>
              <TableCell>Departemen</TableCell>
              <TableCell>Jumlah Yang Diajukan</TableCell>
              <TableCell>Total Biaya</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Radio
                    checked={selectedAssets.some((selected) => selected.id === asset.id)}
                    onChange={() => { handleAssetSelection(asset); }}
                    disabled={asset.statusAset !== 'SEDANG_DIPINJAM' && asset.statusAset !== 'SEDANG_DISEWA'}
                  />
                </TableCell>
                <TableCell>{getPengajuanName(asset)}</TableCell>
                <TableCell>{asset.namaPenyetuju?.namaLengkap}</TableCell>
                <TableCell>{asset.tujuan}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        asset.statusAset === 'SEDANG_DIPINJAM' || asset.statusAset === 'SEDANG_DISEWA' || asset.statusAset === 'DIKEMBALIKAN'
                          ? '#388e3c'
                          : asset.statusAset === 'PEMINJAMAN_GAGAL' || asset.statusAset === 'PENYEWAAN_GAGAL'
                            ? '#d32f2f'
                            : '#ff9800',
                      backgroundColor:
                        asset.statusAset === 'SEDANG_DIPINJAM' || asset.statusAset === 'SEDANG_DISEWA'|| asset.statusAset === 'DIKEMBALIKAN'
                          ? '#e8f5e9'
                          : asset.statusAset === 'PEMINJAMAN_GAGAL' || asset.statusAset === 'PENYEWAAN_GAGAL'
                            ? '#ffebee'
                            : '#fff3e0',
                    }}
                  >
                    {asset.statusAset}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      color:
                        asset.statusPengajuan === 'DISETUJUI'
                          ? '#388e3c'
                          : asset.statusPengajuan === 'DITOLAK'
                            ? '#d32f2f'
                            : '#ff9800',
                      backgroundColor:
                        asset.statusPengajuan === 'DISETUJUI'
                          ? '#e8f5e9'
                          : asset.statusPengajuan === 'DITOLAK'
                            ? '#ffebee'
                            : '#fff3e0',
                    }}
                  >
                    {asset.statusPengajuan}
                  </Box>
                </TableCell>
                <TableCell>{asset.tanggalMulai}</TableCell>
                <TableCell>{asset.tanggalSelesai}</TableCell>
                <TableCell>{getShiftName(asset)}</TableCell>
                <TableCell>{getAsetName(asset)}</TableCell>
                <TableCell>
                  {asset.fasilitasPeminjaman && asset.fasilitasPeminjaman.length > 0
                    ? asset.fasilitasPeminjaman.map(
                        (fasilitas: { fasilitas: { nama: string }; jumlahDipinjam: number }, idx: number) => (
                          <div key={idx}>
                            {fasilitas.fasilitas.nama} (Jumlah: {fasilitas.jumlahDipinjam})
                          </div>
                        )
                      )
                    : asset.fasilitasPenyewaan && asset.fasilitasPenyewaan.length > 0
                      ? asset.fasilitasPenyewaan.map(
                          (fasilitas: { fasilitas: { nama: string }; jumlahDisewa: number }, idx: number) => (
                            <div key={idx}>
                              {fasilitas.fasilitas.nama} (Jumlah: {fasilitas.jumlahDisewa})
                            </div>
                          )
                        )
                      : '-'}
                </TableCell>
                <TableCell>{getDepartemenName(asset.departemenId ?? '')}</TableCell>
                <TableCell>{jumlahYangDiajukan(asset)}</TableCell>
                <TableCell>{asset.totalBiaya ? `Rp. ${asset.totalBiaya.toLocaleString('id-ID')}` : '-'}</TableCell>
              </TableRow>
            ))}
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
                Pilih Jenis Pemrosesan
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
                <FormControlLabel value="peminjaman" control={<Radio />} label="Peminjaman" />
                <FormControlLabel value="penyewaan" control={<Radio />} label="Penyewaan" />
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
              {loadingPeminjaman || loadingPenyewaan ? (
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
                Detail Pengembalian
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tujuan Pengembalian"
                    multiline
                    rows={4}
                    value={tujuan}
                    onChange={(e) => { setTujuan(e.target.value); }}
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
                    label="Tanggal Pengembalian"
                    value={tanggalPengembalian}
                    onChange={(newValue) => {
                      const selectedAsset = selectedAssets[0];
                      const tanggalSelesai = dayjs(selectedAsset.tanggalSelesai);
                      const maxReturnDate = tanggalSelesai.add(1, 'day'); // H+1 setelah tanggal selesai

                      // Validasi apakah tanggal yang dipilih adalah tanggal selesai atau H+1 setelahnya
                      if (
                        newValue &&
                        (newValue.isSame(tanggalSelesai, 'day') || newValue.isSame(maxReturnDate, 'day'))
                      ) {
                        setTanggalPengembalian(newValue);
                      } else {
                        setErrorMessage('Tanggal pengembalian harus pada tanggal selesai atau maksimal H+1');
                        setSnackbarSeverity('error');
                        setOpenSnackbar(true);
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          backgroundColor: '#ffffff',
                        },
                      },
                    }}
                    minDate={selectedAssets.length > 0 ? dayjs(selectedAssets[0].tanggalSelesai) : undefined}
                    maxDate={
                      selectedAssets.length > 0 ? dayjs(selectedAssets[0].tanggalSelesai).add(1, 'day') : undefined
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kondisi Aset"
                    select
                    value={kondisiAset || ''}
                    onChange={(e) => { setKondisiAset(e.target.value); }}
                  >
                    <MenuItem value="BAIK">BAIK</MenuItem>
                    <MenuItem value="RUSAK">RUSAK</MenuItem>
                    <MenuItem value="HILANG">HILANG</MenuItem>
                  </TextField>
                </Grid>
                {(kondisiAset === 'RUSAK' || kondisiAset === 'HILANG') && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Deskripsi Kerusakan atau Kehilangan"
                      multiline
                      rows={4}
                      value={deskripsiKerusakan || ''}
                      onChange={(e) => { setDeskripsiKerusakan(e.target.value); }}
                      error={!deskripsiKerusakan?.trim()}
                      helperText="Wajib diisi jika kondisi aset rusak atau hilang"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  {renderFacilitySection()}
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
                bgcolor: '#9a221a',
                '&:hover': {
                  bgcolor: '#f04438',
                },
              }}
            >
              {isSubmitting ? 'Memproses...' : 'Ajukan Pengembalian'}
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
                bgcolor: '#9a221a',
                '&:hover': {
                  bgcolor: '#f04438',
                },
              }}
            >
              Next
            </Button>
          )}
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => { setOpenSnackbar(false); }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => { setOpenSnackbar(false); }} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarSeverity === 'success' ? successMessage : errorMessage}
          </Alert>
        </Snackbar>

        {postError ? <Alert severity="error" sx={{ mt: 2 }}>
            Error: {postError}
          </Alert> : null}
      </Box>
    </LocalizationProvider>
  );
}

export default PengembalianForm;
