import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { useDepartemen } from '@/lib/departemen/departemen';
import { useFasilitas } from '@/lib/fasilitas/fasilitas';
import { useGedung } from '@/lib/gedung/gedung';

interface AddAssetModalProps {
  open: boolean;
  handleClose: () => void;
}

interface Values {
  assetId: string;
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  departemen?: any;
  gedung?: any;
}

const Modal: React.FC<AddAssetModalProps> = ({ open, handleClose }) => {
  const { postFasilitas } = useFasilitas();
  const { departemen, loading: loadingDepartemen } = useDepartemen();
  const { gedung, loading: loadingGedung } = useGedung();
  const [formattedHarga, setFormattedHarga] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<Values>({
    defaultValues: {
      id: '',
      kode: '',
      nama: '',
      departemenId: '',
      gedungId: '',
      lantai: 1,
      harga: '',
      statusAset: '',
      jumlah: 1,
    },
  });

  const onSubmit = async (values: Values): Promise<void> => {
    try {
      const dataToSubmit = {
        ...values,
        jumlah: Number(values.jumlah),
        harga: values.harga ? String(values.harga).replace(/,/g, '') : undefined,
      };
      await postFasilitas(dataToSubmit);
      setSnackbar({ open: true, message: 'Fasilitas berhasil ditambahkan', severity: 'success' });
      reset();
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambah fasilitas';
      setError('root', { type: 'server', message: errorMessage });
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <Typography variant="h5" sx={{ mt: 4, ml: 3 }}>
          Data Fasilitas
        </Typography>
        <Divider variant="inset" sx={{ mt: 2 }} />
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="kode"
              control={control}
              rules={{ required: 'Kode diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Kode"
                  error={Boolean(errors.kode)}
                  helperText={errors.kode?.message}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="nama"
              control={control}
              rules={{ required: 'Nama diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nama"
                  error={Boolean(errors.nama)}
                  helperText={errors.nama?.message}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="harga"
              control={control}
              rules={{ required: 'Harga diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Harga"
                  type="text"
                  value={`Rp ${formattedHarga}`}
                  onChange={(e) => {
                    const value = e.target.value.replace(/Rp /, '').replace(/,/g, '');
                    setFormattedHarga(Number(value).toLocaleString());
                    field.onChange(value);
                  }}
                  error={Boolean(errors.harga)}
                  helperText={errors.harga?.message || 'Contoh: Rp 100,000'}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="jumlah"
              control={control}
              rules={{
                required: 'Jumlah diperlukan',
                pattern: {
                  value: /^[0-9]+$/,
                  message: 'Hanya angka yang diperbolehkan',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Jumlah"
                  type="number"
                  error={Boolean(errors.jumlah)}
                  helperText={errors.jumlah?.message}
                  fullWidth
                  margin="normal"
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              )}
            />
            <Controller
              name="statusAset"
              control={control}
              rules={{ required: 'Status diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  error={Boolean(errors.statusAset)}
                  helperText={errors.statusAset?.message}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="TERSEDIA">Tersedia</MenuItem>
                  <MenuItem value="TIDAK_TERSEDIA">Tidak Tersedia</MenuItem>
                  <MenuItem value="DIPERBAIKI">Diperbaiki</MenuItem>
                </TextField>
              )}
            />
            <Divider>Lokasi</Divider>
            <Controller
              name="departemenId"
              control={control}
              rules={{ required: 'Departemen diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Departemen"
                  error={Boolean(errors.departemenId)}
                  helperText={errors.departemenId?.message}
                  fullWidth
                  margin="normal"
                  disabled={loadingDepartemen}
                >
                  {departemen.map((dep) => (
                    <MenuItem key={dep.id} value={dep.id}>
                      {dep.nama}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="gedungId"
              control={control}
              rules={{ required: 'Gedung diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Gedung"
                  error={Boolean(errors.gedungId)}
                  helperText={errors.gedungId?.message}
                  fullWidth
                  margin="normal"
                  disabled={loadingGedung}
                >
                  {gedung.map((ged) => (
                    <MenuItem key={ged.id} value={ged.id}>
                      {ged.nama}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="lantai"
              control={control}
              rules={{ required: 'Lantai diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Lantai"
                  error={Boolean(errors.lantai)}
                  helperText={errors.lantai?.message}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value={1}>Lantai 1</MenuItem>
                  <MenuItem value={2}>Lantai 2</MenuItem>
                  <MenuItem value={3}>Lantai 3</MenuItem>
                </TextField>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ mb: 2, mr: 2 }}>
          <Button onClick={handleClose} variant="outlined" color="error">
            Batal
          </Button>
          <Button type="submit" variant="contained" onClick={handleSubmit(onSubmit)}>
            Tambah
          </Button>
        </DialogActions>
        {errors.root ? (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {errors.root.message}
          </Alert>
        ) : null}
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Modal;
