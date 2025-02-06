import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  ListItem,
  MenuItem,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { useRuanganLab } from '@/lib/aset/RuanganLab/useRuanganLab';
import { useRuanganUmum } from '@/lib/aset/RuanganUmum/useRuanganUmum';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useGedung } from '@/lib/gedung/gedung';
import { useShift } from '@/lib/shift/shift';
import { useUser } from '@/lib/UserManagement/UseUser';

interface AddAssetModalProps {
  open: boolean;
  handleClose: () => void;
}

interface Values {
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  shiftId?: any;
  pengawasLabId?: string;
}

type JenisRuangan = 'ruangan_umum' | 'ruangan_laboratorium';

const Modal: React.FC<AddAssetModalProps> = ({ open, handleClose }) => {
  const { postRuanganUmum } = useRuanganUmum();
  const { postRuanganLab } = useRuanganLab();
  const { departemen, loading: loadingDepartemen } = useDepartemen();
  const { gedung, loading: loadingGedung } = useGedung();
  const { shift } = useShift();
  const { users: pengawasLab, loading: loadingPengawasLab } = useUser();
  const [formattedHarga, setFormattedHarga] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [jenisRuangan, setJenisRuangan] = React.useState<JenisRuangan>('ruangan_umum');

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
      shiftId: '',
      pengawasLabId: '',
    },
  });

  const handleJenisRuanganChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJenisRuangan(event.target.value as JenisRuangan);
    reset();
  };

  const onSubmit = async (values: Values): Promise<void> => {
    try {
      const dataToSubmit = {
        ...values,
        jumlah: Number(values.jumlah),
        harga: values.harga ? values.harga.replace(/,/g, '') : undefined,
      };

      if (jenisRuangan === 'ruangan_umum') {
        await postRuanganUmum(dataToSubmit);
      } else {
        await postRuanganLab(dataToSubmit);
      }
      setSnackbar({ open: true, message: 'Ruangan berhasil ditambahkan', severity: 'success' });
      reset();
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambah ruangan';
      setError('root', { type: 'server', message: errorMessage });
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSnackbarClose = () => { setSnackbar({ ...snackbar, open: false }); };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <ListItem>
            <Typography variant="h5">Data Aset Ruangan</Typography>
          </ListItem>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">Pilih Jenis Ruangan</FormLabel>
            <RadioGroup
              aria-label="pilih-jenis-ruangan"
              name="jenis-ruangan"
              value={jenisRuangan}
              onChange={handleJenisRuanganChange}
            >
              <FormControlLabel value="ruangan_umum" control={<Radio />} label="Ruangan Umum" />
              <FormControlLabel value="ruangan_laboratorium" control={<Radio />} label="Ruangan Laboratorium" />
            </RadioGroup>
          </FormControl>

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
                  disabled={loadingPengawasLab}
                  value={field.value || ''} // Ensure empty string as fallback
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
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            sx={{ bgcolor: '#FFCC28', '&:hover': { bgcolor: '#ffc107' } }}
          >
            Tambah
          </Button>
        </DialogActions>
        {errors.root ? <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {errors.root.message}
          </Alert> : null}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
