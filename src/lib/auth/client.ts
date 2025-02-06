'use client';

import axios from 'axios';

import type { User } from '@/types/user';
import { paths } from '@/paths'

export interface SignUpParams {
  noIdentitas: string;
  namaLengkap: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface resendVerificationParams {
  noIdentitas: string;
  namaLengkap: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface SignInWithPasswordParams {
  noIdentitas: string;
  password: string;
}

export interface UpdatePasswordParams {
  id: string;
  newPassword: string;
  oldPassword: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string; user?: User; message?: string }> {
    const { noIdentitas, namaLengkap, email, phoneNumber, password } = params;
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        noIdentitas,
        namaLengkap,
        email,
        phoneNumber,
        password,
      });
      console.log('Respons register:', response.data);

      const { content, message } = response.data;

      if (content?.token) {
        localStorage.setItem('custom-auth-token', content.token);
        localStorage.setItem('user', JSON.stringify(content.user)); 
        return {
          user: content.user,
          message: 'Successfully Registered! Please check your email for verification link.',
        }; 
      } 
        return { error: 'Registrasi gagal. Token tidak diterima.' };
      
    } catch (error) {
      console.error('Error registrasi:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detail error Axios:', error.response?.data);
        return { error: error.response?.data.message || 'Terjadi kesalahan saat register' };
      } 
        return { error: 'Terjadi kesalahan yang tidak terduga.' };
      
    }
  }

  async signInWithPassword(
    params: SignInWithPasswordParams
  ): Promise<{ error?: string; user?: User; message?: string }> {
    const { noIdentitas, password } = params;

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        noIdentitas,
        password,
      });
      console.log('Respons login:', response.data);

      const { content, message } = response.data;

      if (content?.token) {
        localStorage.setItem('custom-auth-token', content.token);
        localStorage.setItem('user', JSON.stringify(content.user)); 
        return { user: content.user, message }; 
      } 
        console.error('Login gagal: Token tidak diterima');
        return { error: 'Login gagal. Token tidak diterima.' };
      
    } catch (error) {
      console.error('Error login:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detail error Axios:', error.response?.data);
        return { error: error.response?.data.message || 'Terjadi kesalahan saat login' };
      } 
        return { error: 'Terjadi kesalahan yang tidak terduga.' };
      
    }
  }

  async updatePassword(params: UpdatePasswordParams): Promise<{ error?: string; message?: string }> {
    const { id, newPassword, oldPassword } = params;

    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { error: 'Token tidak ditemukan. Harap login kembali.' };
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/update-password?id=${id}`,
        { newPassword, oldPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { message } = response.data;
      return { message: message || 'Password updated successfully!' };
    } catch (error) {
      console.error('Error updating password:', error);
      if (axios.isAxiosError(error)) {
        return {
          error: error.response?.data.message || 'Failed to update password',
        };
      }
      return { error: 'An unexpected error occurred.' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    if (typeof window === 'undefined') {
      return { data: null };
    }

    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { data: null };
    }

    const user = localStorage.getItem('user');
    if (user) {
      return { data: JSON.parse(user) };
    } 
      return { data: null };
    
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user');
    window.location.href = paths.auth.signIn;
    return {};
  }

  async resendVerification(params: resendVerificationParams): Promise<{ error?: string; message?: string }> {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/resend-verification`, {
        noIdentitas: params.noIdentitas,
        namaLengkap: params.namaLengkap,
        email: params.email,
        phoneNumber: params.phoneNumber,
        password: params.password,
      });

      const { message } = response.data;
      return { message: message || 'Email verifikasi telah dikirim ulang!' };
    } catch (error) {
      console.error('Error mengirim ulang verifikasi:', error);
      if (axios.isAxiosError(error)) {
        return {
          error: error.response?.data.message || 'Gagal mengirim email verifikasi',
        };
      }
      return { error: 'Terjadi kesalahan yang tidak terduga.' };
    }
  }
}

export const authClient = new AuthClient();
