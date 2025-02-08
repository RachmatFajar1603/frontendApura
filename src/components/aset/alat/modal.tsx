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

import { useAlat } from '@/lib/aset/alat/useAlat';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useGedung } from '@/lib/gedung/gedung';
import { useShift } from '@/lib/shift/shift';
import { useUser } from '@/lib/UserManagement/UseUser';
import { useUsers } from '@/hooks/use-user';

interface AddAssetModalProps {
  open: boolean;
  handleClose: () => void;
}

interface Values {
  id: string;
  kode: string;
  nama: string;
  laboratorium: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  shiftId?: any;
  pengawasLabId?: string;
}

const Modal: React.FC<AddAssetModalProps> = ({ open, handleClose }) => {
  const { postAlat } = useAlat();
  const { departemen, loading: loadingDepartemen } = useDepartemen();
  const { gedung, loading: loadingGedung } = useGedung();
  const { shift, loading: loadingShift } = useShift();
  const { users: pengawasLab, loading: loadingPengawasLab } = useUser();
  const { user } = useUsers();
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
      laboratorium: '',
      departemenId: user?.departemenId || '',
      gedungId: '',
      lantai: 1,
      harga: '',
      statusAset: '',
      jumlah: 1,
      shiftId: '',
      pengawasLabId: user?.id || '',
    },
  });

  const onSubmit = async (values: Values): Promise<void> => {
    try {
      const dataToSubmit = {
        ...values,
        jumlah: Number(values.jumlah),
        harga: values.harga ? Number(values.harga.replace(/,/g, '')) : undefined,
      };

      await postAlat(dataToSubmit);
      setSnackbar({ open: true, message: 'Alat berhasil ditambahkan', severity: 'success' });
      reset();
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambah alat';
      setError('root', { type: 'server', message: errorMessage });
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  React.useEffect(() => {
    if (user?.role === 'PENGAWAS_LAB') {
      // Disable field pengawasLab dan departemen jika user adalah PENGAWAS_LAB
      const pengawasLabField = document.querySelector('input[name="pengawasLabId"]')!;
      const departemenField = document.querySelector('input[name="departemenId"]')!;

      if (pengawasLabField) (pengawasLabField as HTMLInputElement).disabled = true;
      if (departemenField) (departemenField as HTMLInputElement).disabled = true;
    }
  }, [user]);

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <Typography variant="h5" sx={{ mt: 4, ml: 3 }}>
          Data Aset Alat
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
              name="pengawasLabId"
              control={control}
              rules={{ required: 'Pengawas Lab diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Pengawas Lab"
                  error={Boolean(errors.pengawasLabId)}
                  helperText={errors.pengawasLabId?.message}
                  fullWidth
                  margin="normal"
                  disabled={user?.role === 'PENGAWAS_LAB' || loadingPengawasLab}
                >
                  {loadingPengawasLab ? (
                    <MenuItem value="">Loading...</MenuItem>
                  ) : pengawasLab ? (
                    pengawasLab
                      .filter((pengawas) => pengawas.role === 'PENGAWAS_LAB')
                      .map((pengawas) => (
                        <MenuItem key={pengawas.id} value={pengawas.id}>
                          {pengawas.namaLengkap}
                        </MenuItem>
                      ))
                  ) : (
                    <MenuItem value="">No data available</MenuItem>
                  )}
                </TextField>
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
                  <MenuItem value="SEDANG_DIPERBAIKI">Diperbaiki</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="shiftId"
              control={control}
              rules={{ required: 'Shift diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Shift"
                  error={Boolean(errors.shiftId)}
                  helperText={errors.shiftId ? String(errors.shiftId.message) : undefined}
                  fullWidth
                  margin="normal"
                >
                  {shift.map((shift) => (
                    <MenuItem key={shift.id} value={shift.id}>
                      {shift.namaShift} - {shift.jamMulai} - {shift.jamSelesai}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Divider>Lokasi</Divider>
            <Controller
              name="laboratorium"
              control={control}
              rules={{ required: 'Laboratorium diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Laboratorium"
                  error={Boolean(errors.laboratorium)}
                  helperText={errors.laboratorium?.message}
                  fullWidth
                  margin="normal"
                />
              )}
            />
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
                  disabled={user?.role === 'PENGAWAS_LAB' || loadingDepartemen}
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
