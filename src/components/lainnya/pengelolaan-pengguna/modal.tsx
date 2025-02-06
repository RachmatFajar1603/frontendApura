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
import { Eye as EyeIcon, EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr';
import { Controller, useForm } from 'react-hook-form';

import { useDepartemen } from '@/lib/departemen/departemen';

import { useUser } from '../../../lib/UserManagement/UseUser';

interface AddAssetModalProps {
  open: boolean;
  handleClose: () => void;
}

interface Values {
  id: string;
  namaLengkap: string;
  noIdentitas: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  departemenId?: string;
}

// Roles that require department selection
const ROLES_WITH_DEPARTMENT = ['ADMIN', 'DEKAN', 'KADEP', 'KALAB', 'PENGAWAS_LAB', 'WD2', 'MAHASISWA'];

const Modal: React.FC<AddAssetModalProps> = ({ open, handleClose }) => {
  const { postUser, getUser } = useUser();
  const { departemen } = useDepartemen();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
    reset,
  } = useForm<Values>({
    defaultValues: {
      id: '',
      namaLengkap: '',
      noIdentitas: '',
      email: '',
      phoneNumber: '',
      role: '',
      password: '',
      departemenId: '',
    },
  });

  const selectedRole = watch('role');
  const shouldShowDepartment = ROLES_WITH_DEPARTMENT.includes(selectedRole);

  const onSubmit = async (values: Values): Promise<void> => {
    try {
      // Pastikan format data sesuai
      const userData = {
        namaLengkap: values.namaLengkap,
        noIdentitas: values.noIdentitas,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: values.role,
        password: values.password,
        ...(shouldShowDepartment && { departemenId: values.departemenId }),
      };

      const response = await postUser(userData);
      await getUser();
      setSnackbar({
        open: true,
        message:
          'Pengguna berhasil ditambahkan. Catatan: Password tidak akan ditampilkan kembali untuk alasan keamanan.',
        severity: 'success',
      });
      reset();
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambah pengguna';
      setError('root', { type: 'server', message: errorMessage });
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSnackbarClose = () => { setSnackbar({ ...snackbar, open: false }); };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <Typography variant="h5" sx={{ mt: 4, ml: 3 }}>
          Data Pengguna
        </Typography>
        <Divider variant="inset" sx={{ mt: 2 }} />
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {['noIdentitas', 'namaLengkap', 'phoneNumber', 'email'].map((field) => (
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
              name="role"
              control={control}
              rules={{ required: 'Role diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Role"
                  error={Boolean(errors.role)}
                  helperText={errors.role?.message}
                  fullWidth
                  margin="normal"
                >
                  {['ADMIN', 'USER', 'DEKAN', 'KADEP', 'KALAB', 'PENGAWAS_LAB', 'WD2', 'MAHASISWA'].map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {shouldShowDepartment ? <Controller
                name="departemenId"
                control={control}
                rules={{ required: shouldShowDepartment ? 'Departemen diperlukan' : false }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Departemen"
                    error={Boolean(errors.departemenId)}
                    helperText={errors.departemenId?.message}
                    fullWidth
                    margin="normal"
                  >
                    {departemen.map((dep) => (
                      <MenuItem key={dep.id} value={dep.id}>
                        {dep.nama}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              /> : null}
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Password diperlukan' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: showPassword ? (
                      <EyeIcon cursor="pointer" onClick={() => { setShowPassword(false); }} />
                    ) : (
                      <EyeSlashIcon cursor="pointer" onClick={() => { setShowPassword(true); }} />
                    ),
                  }}
                />
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
