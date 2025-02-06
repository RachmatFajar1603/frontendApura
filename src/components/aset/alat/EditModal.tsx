import React, { useState } from 'react';
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

interface EditModalProps {
  open: boolean;
  handleClose: () => void;
  initialData?: Values | null;
  onSuccess: () => void;
}

interface Values {
  id: string;
  kode: string;
  nama: string;
  laboratorium: string;
  departemenId?: string;
  gedungId?: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  shiftId?: any;
  pengawasLabId?: string;
}

const EditModal: React.FC<EditModalProps> = ({ open, handleClose, initialData, onSuccess }) => {
  const { postAlat, updateAlat } = useAlat();
  const { departemen, loading: loadingDepartemen } = useDepartemen();
  const { users: pengawasLab, loading: loadingPengawasLab } = useUser();
  const { gedung, loading: loadingGedung } = useGedung();
  const { shift } = useShift();
  const [formattedHarga, setFormattedHarga] = React.useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<Values>({
    defaultValues: initialData || {
      id: '',
      kode: '',
      nama: '',
      laboratorium: '',
      departemenId: '',
      gedungId: '',
      lantai: 1,
      harga: '',
      statusAset: '',
      jumlah: 1,
      shiftId: '',
      pengawasLabId: '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  React.useEffect(() => {
    if (initialData?.harga) {
      setFormattedHarga(Number(initialData.harga).toLocaleString());
    }
  }, [initialData]);

  const onSubmit = async (values: Values): Promise<void> => {
    setLoading(true);
    try {
      let response;
      const updateData = {
        ...values,
        jumlah: parseInt(values.jumlah.toString(), 10),
        harga: values.harga
          ? typeof values.harga === 'string'
            ? Number(values.harga.replace(/[^\d]/g, ''))
            : Number(values.harga)
          : undefined,
        departemen: { connect: { id: values.departemenId } },
        gedung: { connect: { id: values.gedungId } },
        shift: { connect: { id: values.shiftId } },
        pengawasLab: { connect: { id: values.pengawasLabId } },
      };
      delete updateData.departemenId;
      delete updateData.gedungId;
      delete updateData.shiftId;
      delete updateData.pengawasLabId; // Delete pengawasLabId since we're using pengawasLab.connect

      if (initialData) {
        response = await updateAlat(values.id, updateData);
      } else {
        response = await postAlat({
          ...updateData,
          departemenId: values.departemenId || '',
          gedungId: values.gedungId || '',
          shiftId: values.shiftId || '',
          pengawasLabId: values.pengawasLabId || '',
        });
      }

      setSnackbar({ open: true, message: 'Data berhasil diperbarui', severity: 'success' });

      reset();
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan data aset';
      console.error('Error message:', errorMessage);

      setError('root', { type: 'server', message: errorMessage });
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => { setSnackbar({ ...snackbar, open: false }); };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <Typography variant="h5" sx={{ mt: 4, ml: 3 }}>
          {initialData ? 'Edit Aset' : 'Tambah Aset'}
        </Typography>
        <Divider variant="inset" sx={{ mt: 2 }} />
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Kode and Nama */}
            {['kode', 'nama'].map((field) => (
              <Controller
                key={field}
                name={field as keyof Values}
                control={control}
                rules={{ required: `${field} diperlukan` }}
                render={({ field: { ref, ...inputProps } }) => (
                  <TextField
                    {...inputProps}
                    inputRef={ref}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    error={Boolean(errors[field as keyof Values])}
                    helperText={errors[field as keyof Values]?.message?.toString()}
                    fullWidth
                    margin="normal"
                  />
                )}
              />
            ))}
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
                  disabled={loadingPengawasLab}
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
                  // Change this line to handle both formatted value and empty state
                  value={field.value ? `Rp ${formattedHarga || Number(field.value).toLocaleString()}` : 'Rp '}
                  onChange={(e) => {
                    const value = e.target.value.replace(/Rp /, '').replace(/,/g, '');
                    setFormattedHarga(Number(value || 0).toLocaleString());
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

            {/* Status Aset Selection */}
            <Controller
              name="statusAset"
              control={control}
              rules={{ required: 'Status aset diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status Aset"
                  error={Boolean(errors.statusAset)}
                  helperText={errors.statusAset?.message}
                  fullWidth
                  margin="normal"
                >
                  {['TERSEDIA', 'TIDAK_TERSEDIA', 'SEDANG_DIPERBAIKI'].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
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

            {/* Gedung Selection */}
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

            {/* Lantai Selection */}
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
                  {[1, 2, 3].map((lantai) => (
                    <MenuItem key={lantai} value={lantai}>
                      Lantai {lantai}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Submit Button */}
            <DialogActions sx={{ mb: 2, mr: 2 }}>
              <Button onClick={handleClose} variant="outlined" color="error">
                Batal
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: '#FFCC28', '&:hover': { bgcolor: '#ffc107' } }}
                disabled={loading}
              >
                {initialData ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>

        {/* Error handling */}
        {errors.root ? <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {errors.root.message}
          </Alert> : null}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditModal;
