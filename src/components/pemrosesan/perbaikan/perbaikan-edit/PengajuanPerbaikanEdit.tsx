'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Grid,
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
  useTheme,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SkipBack } from '@phosphor-icons/react/dist/csr/SkipBack';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { SkipForward } from '@phosphor-icons/react/dist/ssr/SkipForward';

import { useAlat } from '@/lib/aset/alat/useAlat';
import { useRuanganLab } from '@/lib/aset/RuanganLab/useRuanganLab';
import { useRuanganUmum } from '@/lib/aset/RuanganUmum/useRuanganUmum';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useFasilitas } from '@/lib/fasilitas/fasilitas';
import { useGedung } from '@/lib/gedung/gedung';
import { usePerbaikan } from '@/lib/pemrosesan/perbaikan';

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

interface Perbaikan {
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
  jumlahYangDiPerbaiki?: number;
}

interface SelectedAssetWithQuantity extends AssetDetails {
  quantity: number;
}

function EditPerbaikanForm() {
  const router = useRouter();
  const { id } = useParams();

  const [perbaikan, setPerbaikan] = useState<Perbaikan | null>(null);

  const [selectedAssetType, setSelectedAssetType] = useState<string>('');
  const [selectedAssets, setSelectedAssets] = useState<SelectedAssetWithQuantity[]>([]);
  const [deskripsi, setDeskripsi] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeStep, setActiveStep] = useState(0);

  const { ruanganUmum, loading: loadingRuanganUmum } = useRuanganUmum();
  const { ruanganLab, loading: loadingRuanganLab } = useRuanganLab();
  const { alat, loading: loadingAlat } = useAlat();
  const { departemen } = useDepartemen();
  const { gedung } = useGedung();
  const { getPerbaikanById, updatePerbaikan, error: postError } = usePerbaikan();
  const { fasilitas } = useFasilitas();

  const steps = ['Pilih Jenis Aset', 'Pilih Aset', 'Detail Perbaikan'];

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const perbaikanData = await getPerbaikanById(id as string);
        if (perbaikanData) {
          setPerbaikan(perbaikanData);
          setDeskripsi(perbaikanData.deskripsi);

          if (perbaikanData.ruangUmumId) {
            setSelectedAssetType('ruanganUmum');
          } else if (perbaikanData.ruangLabId) {
            setSelectedAssetType('ruanganLab');
          } else if (perbaikanData.alatId) {
            setSelectedAssetType('alat');
          } else if (perbaikanData.fasilitasId) {
            setSelectedAssetType('fasilitas');
          }
        }
      }
    };

    fetchData();
  }, [id, getPerbaikanById]);

  useEffect(() => {
    if (perbaikan && selectedAssetType) {
      let selectedAsset;
      const assetQuantity = perbaikan.jumlahYangDiPerbaiki;
      switch (selectedAssetType) {
        case 'ruanganUmum':
          selectedAsset = ruanganUmum.find((asset) => asset.id === perbaikan.ruangUmumId);
          break;
        case 'ruanganLab':
          selectedAsset = ruanganLab.find((asset) => asset.id === perbaikan.ruangLabId);
          break;
        case 'alat':
          selectedAsset = alat.find((asset) => asset.id === perbaikan.alatId);
          break;
        case 'fasilitas':
          selectedAsset = fasilitas.find((asset) => asset.id === perbaikan.fasilitasId);
          break;
      }
      if (selectedAsset) {
        setSelectedAssets([{ ...selectedAsset, quantity: assetQuantity || 1 }]);
      }
    }
  }, [perbaikan, selectedAssetType, ruanganUmum, ruanganLab, alat, fasilitas]);

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
    setSelectedAssets((prevSelectedAssets) => {
      // If the clicked asset is already selected, deselect it
      if (prevSelectedAssets.some((selectedAsset) => selectedAsset.id === asset.id)) {
        return [];
      }
      // Otherwise, select only this asset
      return [{ ...asset, quantity: 1 }];
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

  const handleSubmit = async () => {
    if (!deskripsi.trim() || selectedAssets.length === 0) {
      setErrorMessage('Deskripsi dan aset harus diisi');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const updatedPerbaikan: any = {
      deskripsi,
      jumlahYangDiPerbaiki: selectedAssets[0].quantity,
    };

    switch (selectedAssetType) {
      case 'ruanganUmum':
        updatedPerbaikan.ruangUmumId = selectedAssets[0].id;
        break;
      case 'ruanganLab':
        updatedPerbaikan.ruangLabId = selectedAssets[0].id;
        break;
      case 'alat':
        updatedPerbaikan.alatId = selectedAssets[0].id;
        break;
      case 'fasilitas':
        updatedPerbaikan.fasilitasId = selectedAssets[0].id;
        break;
    }

    try {
      await updatePerbaikan(id as string, updatedPerbaikan);
      setSuccessMessage('Perbaikan berhasil diubah');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      router.push('/perbaikan');
    } catch (error) {
      setErrorMessage('Terjadi kesalahan saat mengubah perbaikan');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
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
      case 'fasilitas':
        assets = fasilitas as AssetDetails[];
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
              <TableCell>Kode</TableCell>
              <TableCell>Nama</TableCell>
              {selectedAssetType === 'alat' && <TableCell>Nama Laboratorium</TableCell>}
              <TableCell>Departemen</TableCell>
              <TableCell>Gedung</TableCell>
              <TableCell>Lantai</TableCell>
              <TableCell>Jumlah Tersedia</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Shift</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => {
              const selectedAsset = selectedAssets.find((selected) => selected.id === asset.id);
              const isSelected = Boolean(selectedAsset);
              const disabled = asset.jumlah === 0;
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
                          handleAssetSelection(asset);
                        }}
                        disabled={disabled}
                      />
                    </TableCell>
                    <TableCell>{asset.kode}</TableCell>
                    <TableCell>{asset.nama}</TableCell>
                    {selectedAssetType === 'alat' && <TableCell>{asset.laboratorium}</TableCell>}
                    <TableCell>{getDepartemenName(asset.departemenId)}</TableCell>
                    <TableCell>{getGedungName(asset.gedungId)}</TableCell>
                    <TableCell>{asset.lantai}</TableCell>
                    <TableCell>{asset.jumlah}</TableCell>
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
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {asset.shift?.namaShift}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {asset.shift?.jamMulai} - {asset.shift?.jamSelesai}
                      </Typography>
                    </TableCell>
                  </TableRow>
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
                Jenis Aset
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
                <FormControlLabel
                  value="fasilitas"
                  control={<Radio />}
                  label="Fasilitas"
                  disabled={selectedAssetType !== 'fasilitas'}
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
                Detail Perbaikan
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tujuan Perbaikan"
                    multiline
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => {
                      setDeskripsi(e.target.value);
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
              {isSubmitting ? 'Memproses...' : 'Ajukan Perbaikan'}
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

export default EditPerbaikanForm;
