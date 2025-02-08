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
  initialData?: Values | null; // Optional data for editing
  onSuccess: () => void; // Callback after success
}

interface Values {
  id: string;
  namaLengkap: string;
  noIdentitas: string;
  email: string;
  phoneNumber: string;
  role: string;
  password?: string; // Optional for editing
  departemenId?: string;
}

const ROLES_WITH_DEPARTMENT = ['ADMIN', 'DEKAN', 'KADEP', 'KALAB', 'PENGAWAS_LAB', 'WD2', 'MAHASISWA'];

const EditModal: React.FC<AddAssetModalProps> = ({ open, handleClose, initialData, onSuccess }) => {
  const { postUser, updateUser } = useUser();
  const { departemen } = useDepartemen();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const defaultValues = {
    ...(initialData || {
      id: '',
      namaLengkap: '',
      noIdentitas: '',
      email: '',
      phoneNumber: '',
      role: '',
      departemenId: '',
    }),
    password: '', // Password selalu kosong di form edit
  };

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
    reset,
  } = useForm<Values>({
    defaultValues,
  });

  const selectedRole = watch('role');
  const shouldShowDepartment = ROLES_WITH_DEPARTMENT.includes(selectedRole);

  // Populate form with existing data if editing
  React.useEffect(() => {
    if (initialData) {
      // Reset form tapi dengan password kosong
      reset({
        ...initialData,
        password: '', // Kosongkan password
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (values: Values): Promise<void> => {
    try {
      let response;
      if (initialData) {
        // Format data untuk update
        const dataToUpdate = {
          ...values,
          ...(shouldShowDepartment && values.departemenId
            ? { departemen: { connect: { id: values.departemenId } } }
            : { departemen: { disconnect: true } }),
        };

        // Hapus departemenId dari object karena sudah diformat
        delete dataToUpdate.departemenId;

        // Hapus password jika kosong
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }

        response = await updateUser(values.id, dataToUpdate);
      } else {
        // Format data untuk create new user
        const dataToCreate = {
          ...values,
          ...(shouldShowDepartment && values.departemenId
            ? { departemen: { connect: { id: values.departemenId } } }
            : undefined),
        };

        // Hapus departemenId dari object
        delete dataToCreate.departemenId;

        response = await postUser(dataToCreate);
      }

      const message = response.message || 'Operasi berhasil';
      setSnackbar({ open: true, message, severity: 'success' });

      reset();
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan pengguna';
      console.error('Error message:', errorMessage);

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
          {initialData ? 'Edit Pengguna' : 'Tambah Pengguna'}
        </Typography>
        <Divider variant="inset" sx={{ mt: 2 }} />
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Name, ID, Phone Number, and Email */}
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
                    helperText={errors[field as keyof Values]?.message}
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
            {shouldShowDepartment ? (
              <Controller
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
              />
            ) : null}
            <Controller
              name="password"
              control={control}
              rules={{ required: !initialData }} // Password opsional saat edit
              render={({ field }) => (
                <TextField
                  {...field}
                  label={initialData ? 'Password Baru' : 'Password'}
                  type={showPassword ? 'text' : 'password'}
                  error={Boolean(errors.password)}
                  helperText={
                    initialData ? 'Masukkan password baru jika ingin mengubah password' : errors.password?.message
                  }
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        onClick={() => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        onClick={() => {
                          setShowPassword(true);
                        }}
                      />
                    ),
                  }}
                />
              )}
            />
            {/* Submit Button */}
            <DialogActions sx={{ mb: 2, mr: 2 }}>
              <Button onClick={handleClose} variant="outlined" color="error">
                Batal
              </Button>
              <Button type="submit" variant="contained">
                {initialData ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>

        {/* Error handling */}
        {errors.root ? (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {errors.root.message}
          </Alert>
        ) : null}
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
