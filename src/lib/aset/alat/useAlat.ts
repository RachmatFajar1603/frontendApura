import React from 'react';
import { AxiosError } from 'axios';

import api from '@/lib/api';

interface Departemen {
  id: string;
  nama: string;
}

interface Gedung {
  id: string;
  nama: string;
}

interface Alat {
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
  shift?: any;
  shiftId?: string;
  laboratorium: string;
  pengawasLab?: any;
  pengawasLabId?: string;
  qrCode?: any;
  departemen?: Departemen;
  gedung?: Gedung;
}

export const useAlat = () => {
  const [alat, setAlat] = React.useState<Alat[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  const getAlat = React.useCallback(
    async (page = currentPage, rows = rowsPerPage) => {
      setLoading(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/alat?page=${page}&rows=${rows}`);
        const data = response.data;
        setAlat(data.content.entries);
        setTotalData(data.content.totalData);
        setCurrentPage(page);
        setRowsPerPage(rows);
        return response.data;
      } catch (error) {
        setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, rowsPerPage]
  );

  const getAlatById = React.useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/alat/${id}`);
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
  }, []);

  const postAlat = React.useCallback(async (alatData: Omit<Alat, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/alat`, alatData);
      await getAlat(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, getAlat]);

  const updateAlat = React.useCallback(async (id: string, updatedAlat: Partial<Alat>) => {
    setLoading(true);
    try {
      const sanitizedData = {
        ...updatedAlat,
        jumlah: parseInt(updatedAlat.jumlah?.toString() || '0', 10),
        harga: parseInt(updatedAlat.harga?.toString() || '0', 10),
      };

      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/alat/${id}`, sanitizedData);
      const updatedAlatData = response.data.content;

      setAlat((prevAlat) => prevAlat.map((item) => (item.id === id ? { ...item, ...updatedAlatData } : item)));

      return {
        status: response.status,
        message: response.data.message,
        data: updatedAlatData,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAlat = React.useCallback(async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/alat?ids=${encodeURIComponent(JSON.stringify(ids))}`
      );

      setAlat((prevAlat) => prevAlat.filter((item) => !ids.includes(item.id)));
      setTotalData((prevTotal) => prevTotal - ids.length);
      const newTotalPages = Math.ceil((totalData - ids.length) / rowsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
        getAlat(newTotalPages, rowsPerPage);
      }

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
  }, [currentPage, rowsPerPage, totalData, getAlat]);

  React.useEffect(() => {
    getAlat();
  }, [getAlat]);

  return {
    alat,
    loading,
    error,
    getAlat,
    postAlat,
    totalData,
    currentPage,
    rowsPerPage,
    setCurrentPage,
    setRowsPerPage,
    getAlatById,
    updateAlat,
    deleteAlat,
  };
};
