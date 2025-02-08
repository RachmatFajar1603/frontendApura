'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { useFasilitas, type Fasilitas } from '@/lib/fasilitas/fasilitas';
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

interface Pengembalian {
  id: string;
  peminjamanId?: string;
  penyewaanId?: string;
  userId?: string;
  namaPenyetujuId?: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: string;
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
  totalBiaya?: any;
  fasilitasPeminjaman?: any;
  fasilitasPenyewaan?: any;
}

interface FacilitySelection {
  id: string;
  kondisiAset: 'BAIK' | 'RUSAK' | 'HILANG';
}

function EditPengembalianForm() {
  const router = useRouter();
  const { id } = useParams();

  const [pengembalian, setPengembalian] = useState<Pengembalian | null>(null);

  const [selectedAssetType, setSelectedAssetType] = useState<string>('');
  const [selectedAssets, setSelectedAssets] = useState<AssetDetails[]>([]);
  const [tujuan, setTujuan] = useState('');
  const [tanggalPengembalian, setTanggalPengembalian] = useState<Dayjs | null>(null);
  const [jumlahYangDikembalikan, setJumlahYangDikembalikan] = useState<number | null>(null);
  const [denda, setDenda] = useState<number | null>(null);
  const [kondisiAset, setKondisiAset] = useState<string | null>(null);
  const [deskripsiKerusakan, setDeskripsiKerusakan] = useState<string | null>(null);
  const { loading: fasilitasLoading } = useFasilitas();
  const [selectedFacilities, setSelectedFacilities] = useState<FacilitySelection[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Fasilitas[]>([]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeStep, setActiveStep] = useState(0);

  const { peminjaman, loading: loadingPeminjaman } = usePeminjaman();
  const { penyewaan, loading: loadingPenyewaan } = usePenyewaan();
  const { getPengembalianById, updatePengembalian, error: postError } = usePengembalian();
  // const { user } = useUsers();
  const { departemen } = useDepartemen();

  const theme = useTheme();

  const steps = ['Pilih Jenis Pemrosesan', 'Pilih Aset', 'Detail Pengembalian'];

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const pengembalianData = await getPengembalianById(id as string);
        if (pengembalianData) {
          setPengembalian(pengembalianData);
          setTujuan(pengembalianData?.tujuan || '');
          setTanggalPengembalian(dayjs(pengembalianData?.tanggalPengembalian) || null);
          setJumlahYangDikembalikan(
            pengembalianData?.jumlahPinjamYangDikembalikan || pengembalianData?.jumlahSewaYangDikembalikan || null
          );
          setDenda(pengembalianData?.denda || null);
          setKondisiAset(pengembalianData?.kondisiAset || null);
          setDeskripsiKerusakan(pengembalianData?.deskripsiKerusakan || '');
          setSelectedAssetType(pengembalianData?.peminjamanId ? 'peminjaman' : 'penyewaan');

          // Set selectedFacilities dengan data fasilitas yang sudah dipilih sebelumnya
          if (pengembalianData.fasilitasPengembalian) {
            setSelectedFacilities(pengembalianData.fasilitasPengembalian);
          }
        }
      }
    };
    fetchData();
  }, [id, getPengembalianById]);

  useEffect(() => {
    if (pengembalian && selectedAssetType) {
      let selectedAsset;
      switch (selectedAssetType) {
        case 'peminjaman':
          selectedAsset = peminjaman.find((p) => p.id === pengembalian.peminjamanId);
          break;
        case 'penyewaan':
          selectedAsset = penyewaan.find((p) => p.id === pengembalian.penyewaanId);
          break;
      }
      if (selectedAsset) {
        setSelectedAssets([selectedAsset]);
      }
    }
  }, [pengembalian, selectedAssetType, peminjaman, penyewaan]);

  useEffect(() => {
    if (selectedAssets.length > 0) {
      const selectedAsset = selectedAssets[0];
      let assetFacilities = [];

      // Ambil fasilitas dari peminjaman atau penyewaan
      if (selectedAsset.fasilitasPeminjaman?.length > 0) {
        assetFacilities = selectedAsset.fasilitasPeminjaman.map(
          (fp: { fasilitas: Fasilitas; jumlahDipinjam: number }) => ({
            ...fp.fasilitas,
            jumlahDipinjam: fp.jumlahDipinjam,
          })
        );
      } else if (selectedAsset.fasilitasPenyewaan?.length > 0) {
        assetFacilities = selectedAsset.fasilitasPenyewaan.map(
          (fp: { fasilitas: Fasilitas; jumlahDisewa: number }) => ({
            ...fp.fasilitas,
            jumlahDisewa: fp.jumlahDisewa,
          })
        );
      }

      setFilteredFacilities(assetFacilities);
    } else {
      setFilteredFacilities([]);
    }
  }, [selectedAssets]);

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

  // const handleAssetTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSelectedAssetType(event.target.value);
  //   setSelectedAssets([]);
  // };

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
    if (!tujuan.trim() || !tanggalPengembalian || !kondisiAset || selectedAssets.length === 0 || !selectedFacilities) {
      setErrorMessage('Semua field harus diisi');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Check if selected asset has facilities and if any facility is selected
    const selectedAsset = selectedAssets[0];
    const hasFacilities = selectedAsset.fasilitasPeminjaman?.length > 0 || selectedAsset.fasilitasPenyewaan?.length > 0;
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

    const updatedPengembalian = {
      tujuan,
      tanggalPengembalian: tanggalPengembalian.format('YYYY-MM-DD'),
      denda,
      kondisiAset,
      deskripsiKerusakan,
      fasilitasId: selectedFacilities,
    };

    try {
      await updatePengembalian(id as string, updatedPengembalian);
      setSuccessMessage('Pengembalian berhasil diupdate');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      router.push('/pengembalian');
    } catch (error) {
      setErrorMessage('Error saat memperbarui peminjaman');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFacilitySection = () => {
    if (!selectedAssets.length) {
      return null;
    }

    const selectedAsset = selectedAssets[0];
    const hasFacilities = selectedAsset.fasilitasPeminjaman?.length > 0 || selectedAsset.fasilitasPenyewaan?.length > 0;

    if (!hasFacilities) {
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
          <Alert severity="warning" sx={{ mt: 1 }}>
            Tidak ada fasilitas yang tersedia untuk ruangan ini
          </Alert>
        ) : (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredFacilities.map((facility) => {
                const jumlah = facility.jumlahDipinjam || facility.jumlahDisewa;
                const isSelected = selectedFacilities.some((f) => f.id === facility.id); // Cek apakah fasilitas sudah dipilih
                const selectedFacility = selectedFacilities.find((f) => f.id === facility.id); // Ambil data kondisi fasilitas yang sudah dipilih

                return (
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
                          checked={isSelected} // Gunakan isSelected untuk menentukan status checkbox
                          onChange={() => {
                            handleFacilityChange(facility);
                          }}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {facility.nama}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Jumlah yang {selectedAssetType === 'peminjaman' ? 'Dipinjam' : 'Disewa'}: {jumlah}
                          </Typography>
                        </Box>
                      }
                    />

                    {isSelected ? (
                      <Box sx={{ mt: 2, ml: 4 }}>
                        <TextField
                          select
                          size="small"
                          label="Kondisi Fasilitas"
                          value={selectedFacility?.kondisiAset || 'BAIK'} // Gunakan kondisi yang sudah dipilih sebelumnya
                          onChange={(e) => {
                            handleConditionChange(facility.id, e.target.value as 'BAIK' | 'RUSAK' | 'HILANG');
                          }}
                          sx={{ minWidth: 200 }}
                        >
                          <MenuItem value="BAIK">Baik</MenuItem>
                          <MenuItem value="RUSAK">Rusak</MenuItem>
                          <MenuItem value="HILANG">Hilang</MenuItem>
                        </TextField>
                      </Box>
                    ) : null}
                  </Paper>
                );
              })}
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
            {assets.map((asset, index) => (
              <TableRow
                key={index}
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
                    onChange={() => {
                      handleAssetSelection(asset);
                    }}
                    disabled={
                      (pengembalian?.peminjamanId && pengembalian.peminjamanId !== asset.id) ||
                      (pengembalian?.penyewaanId && pengembalian.penyewaanId !== asset.id) ||
                      (asset.statusAset !== 'SEDANG_DIPINJAM' && asset.statusAset !== 'SEDANG_DISEWA')
                    }
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
                        asset.statusAset === 'SEDANG_DIPINJAM' || asset.statusAset === 'SEDANG_DISEWA'
                          ? '#388e3c'
                          : asset.statusAset === 'PEMINJAMAN_GAGAL' || asset.statusAset === 'PENYEWAAN_GAGAL'
                            ? '#d32f2f'
                            : '#ff9800',
                      backgroundColor:
                        asset.statusAset === 'SEDANG_DIPINJAM' || asset.statusAset === 'SEDANG_DISEWA'
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
                <TableCell>{asset.totalBiaya || '-'}</TableCell>
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
                Pilih Jenis Aset
              </Typography>
              <RadioGroup
                aria-label="jenis-aset"
                name="jenis-aset"
                value={selectedAssetType}
                // onChange={handleAssetTypeChange}
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
                  value="peminjaman"
                  control={<Radio />}
                  label="Peminjaman"
                  disabled={selectedAssetType !== 'peminjaman'}
                />
                <FormControlLabel
                  value="penyewaan"
                  control={<Radio />}
                  label="Penyewaan"
                  disabled={selectedAssetType !== 'penyewaan'}
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
                    value={kondisiAset}
                    onChange={(e) => {
                      setKondisiAset(e.target.value);
                    }}
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
                      label="Deskripsi Kerusakan"
                      multiline
                      rows={4}
                      value={deskripsiKerusakan}
                      onChange={(e) => {
                        setDeskripsiKerusakan(e.target.value);
                      }}
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

export default EditPengembalianForm;
