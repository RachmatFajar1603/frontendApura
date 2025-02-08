import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Snackbar,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { useRuanganLab } from '@/lib/aset/RuanganLab/useRuanganLab';
import { useRuanganUmum } from '@/lib/aset/RuanganUmum/useRuanganUmum';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useGedung } from '@/lib/gedung/gedung';
import { useShift } from '@/lib/shift/shift';
import { useUser } from '@/lib/UserManagement/UseUser';

interface EditModalProps {
  open: boolean;
  handleClose: () => void;
  initialData: any;
  onSuccess: () => void;
  selectedAsset: string;
}

interface FormValues {
  id: string;
  kode: string;
  nama: string;
  lantai: number;
  harga: number;
  statusAset: string;
  jumlah: string;
  departemenId?: string;
  gedungId?: string;
  shiftId?: any;
  pengawasLabId?: string;
}

export default function EditModal({ open, handleClose, initialData, onSuccess, selectedAsset }: EditModalProps) {
  const { updateRuanganLab } = useRuanganLab();
  const { updateRuanganUmum } = useRuanganUmum();
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialData || {
      id: '',
      kode: '',
      nama: '',
      lantai: 1,
      harga: '',
      statusAset: '',
      jumlah: 1,
      departemenId: '',
      gedungId: '',
      shiftId: '',
      pengawasLabId: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (initialData?.harga) {
      setFormattedHarga(Number(initialData.harga).toLocaleString());
    }
  }, [initialData]);

  const onSubmit = async (values: FormValues) => {
    try {
      const updateData = {
        ...values,
        jumlah: parseInt(values.jumlah.toString(), 10),
        harga: values.harga ? values.harga.toString().replace(/[^\d]/g, '') : undefined,
        departemen: { connect: { id: values.departemenId } },
        gedung: { connect: { id: values.gedungId } },
        shift: { connect: { id: values.shiftId } },
        pengawasLab: { connect: { id: values.pengawasLabId } },
      };
      // Remove fields that shouldn't be sent to the API
      const { departemenId, gedungId, shiftId, pengawasLabId, ...finalUpdateData } = updateData;

      if (selectedAsset === 'ruangan_umum') {
        await updateRuanganUmum(values.id, finalUpdateData);
      } else {
        await updateRuanganLab(values.id, finalUpdateData);
      }

      setSnackbar({ open: true, message: 'Data berhasil diperbarui', severity: 'success' });
      reset();
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating data:', error);
      setSnackbar({ open: true, message: 'Gagal memperbarui data', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Ruangan</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {['kode', 'nama'].map((field) => (
              <Controller
                key={field}
                name={field as keyof FormValues}
                control={control}
                rules={{ required: `${field} diperlukan` }}
                render={({ field: { ref, ...inputProps } }) => (
                  <TextField
                    {...inputProps}
                    inputRef={ref}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    error={Boolean(errors[field as keyof FormValues])}
                    helperText={errors[field as keyof FormValues]?.message?.toString()}
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
                  {[1, 2, 3].map((lantai) => (
                    <MenuItem key={lantai} value={lantai}>
                      Lantai {lantai}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ mb: 2, mr: 2 }}>
          <Button onClick={handleClose} variant="outlined" color="error">
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} type="submit" variant="contained">
            Simpan
          </Button>
        </DialogActions>
        {/* Error handling */}
        {errors.root ? (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {errors.root.message}
          </Alert>
        ) : null}
      </Dialog>

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
}
