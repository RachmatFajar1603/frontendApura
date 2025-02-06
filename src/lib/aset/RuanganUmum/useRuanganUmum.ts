import api from '@/lib/api';
import { AxiosError } from 'axios';
import React from 'react';

interface RuanganUmum {
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  created_at?: string;
  updated_at?: string;
  shift?: any
  pengawasLab?: any
  pengawasLabId?: string;
}

export const useRuanganUmum = () => {
  const [ruanganUmum, setRuanganUmum] = React.useState<RuanganUmum[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  const getRuanganUmum = React.useCallback(
    async (page = currentPage, rows = rowsPerPage) => {
      setLoading(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/ruangan-umum?page=${page}&rows=${rows}`);
        const data = response.data;
        setRuanganUmum(data.content.entries);
        setTotalData(data.content.totalData);
        setCurrentPage(page);
        setRowsPerPage(rows);
      } catch (error) {
        setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, rowsPerPage]
  );

  const getRuanganUmumById = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/ruangan-umum/${id}`);
      return {
        status: response.status,
        message: response.data.message,
        data: response.data.content,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const postRuanganUmum = async (ruanganUmum: RuanganUmum) => {
    setLoading(true);
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/ruangan-umum`, ruanganUmum);
      await getRuanganUmum(currentPage, rowsPerPage);
      return {
        status: response.status,
        message: response.data.message,
        data: response.data.content,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const updateRuanganUmum = async (id: string, updateRuanganUmum: Partial<RuanganUmum>) => {
    setLoading(true);
    try {
      
      const sanitizedData = {
        ...updateRuanganUmum,
        jumlah : parseInt(updateRuanganUmum.jumlah?.toString() || '0', 10),
        harga : parseInt(updateRuanganUmum.harga?.toString() || '0', 10),
      }
      
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/ruangan-umum/${id}`, sanitizedData);
      await getRuanganUmum(currentPage, rowsPerPage);
      return {
        status: response.status,
        message: response.data.message,
        data: response.data.content,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const deleteRuanganUmum = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/ruangan-umum?ids=${encodeURIComponent(JSON.stringify(ids))}`);
      await getRuanganUmum(currentPage, rowsPerPage); 
      return {
        status: response.status,
        message: response.data.message,
        data: response.data.content,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getRuanganUmum();
  }, [getRuanganUmum]);

  return{
    ruanganUmum,
    loading,
    error,
    totalData,
    currentPage,
    rowsPerPage,
    setCurrentPage,
    setRowsPerPage,
    getRuanganUmum,
    getRuanganUmumById,
    postRuanganUmum,
    updateRuanganUmum,
    deleteRuanganUmum,
  }
};