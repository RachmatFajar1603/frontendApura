'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { MapPinLine } from '@phosphor-icons/react/dist/ssr/MapPinLine';
import { QrCode } from '@phosphor-icons/react/dist/ssr/QrCode';
import { Toolbox } from '@phosphor-icons/react/dist/ssr/Toolbox';

import { useAlat } from '@/lib/aset/alat/useAlat';

export default function AlatQRScanPage() {
  const params = useParams();
  const { getAlatById, loading, error } = useAlat();
  const [alatDetail, setAlatDetail] = React.useState<any>(null);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAlat = async () => {
      if (!params.id) return;
      try {
        const response = await getAlatById(params.id as string);
        setAlatDetail(response.data);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to fetch equipment data');
      }
    };
    fetchAlat();
  }, [params.id, getAlatById]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || fetchError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
        <Paper elevation={3} sx={{ p: 3, backgroundColor: '#FFF3F0' }}>
          <Typography color="error" variant="h6" textAlign="center">
            {error || fetchError}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!alatDetail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" textAlign="center">
            Alat tidak ditemukan
          </Typography>
        </Paper>
      </Box>
    );
  }

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'TERSEDIA':
        return '#3A7D44';
      case 'SEDANG_DIPERBAIKI':
        return '#FBA518';
      case 'TIDAK_TERSEDIA':
        return '#D70654';
      default:
        return 'default';
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flex={1} p={2} sx={{ overflow: 'hidden' }}>
      <Card sx={{ maxWidth: 600, width: '100%', borderRadius: 2, maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }} elevation={4}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <QrCode size={40} style={{ marginRight: 16, color: 'var(--primary-main)' }} />
            <Typography variant="h5" component="div" fontWeight="bold">
              Detail Peralatan
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* Basic Info Section */}
            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="h6" color="primary" gutterBottom>
                  <Toolbox style={{ marginRight: 1, verticalAlign: 'middle' }} />
                  Informasi Dasar
                </Typography>
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                        <strong>Kode:</strong> {alatDetail.kode}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                        <strong>Nama Aset:</strong> {alatDetail.nama}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                        <strong>Nama Pengawas:</strong> {alatDetail.pengawasLab?.namaLengkap}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                        <strong>Harga:</strong>{' '}
                        {alatDetail.harga ? `Rp ${Number(alatDetail.harga).toLocaleString('id-ID')}` : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                        <strong>Jumlah Unit:</strong> {alatDetail.jumlah || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <strong>Status:</strong>
                        <Chip
                          label={alatDetail.statusAset}
                          sx={{ bgcolor: getStatusColor(alatDetail.statusAset), color: 'white' }}
                          size="small"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Grid>

            {/* Location Section with Department, Lab and Shift */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="h6" color="primary" gutterBottom>
                  <MapPinLine style={{ marginRight: 1, verticalAlign: 'middle' }} />
                  Lokasi
                </Typography>
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                        <strong>Gedung:</strong> {alatDetail.gedung?.nama}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                        <strong>Lantai:</strong> {alatDetail.lantai}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                        <strong>Departemen:</strong> {alatDetail.departemen?.nama || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                        <strong>Nama Lab:</strong> {alatDetail.laboratorium || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong>Shift:</strong> {alatDetail.shift?.namaShift} ({alatDetail.shift?.jamMulai} -{' '}
                        {alatDetail.shift?.jamSelesai})
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
