import React from 'react';
import { AxiosError } from 'axios';

import api from '@/lib/api';

interface RuanganLab {
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
  pengawasLab?: any;
  pengawasLabId?: string;
}

export const useRuanganLab = () => {
  const [ruanganLab, setRuanganLab] = React.useState<RuanganLab[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  const getRuanganLab = React.useCallback(
    async (page = currentPage, rows = rowsPerPage) => {
      setLoading(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/ruang-lab?page=${page}&rows=${rows}`);
        const data = response.data;
        setRuanganLab(data.content.entries);
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

  const getRuanganLabById = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/ruang-lab/${id}`);
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

  const postRuanganLab = async (ruanganLab: RuanganLab) => {
    setLoading(true);
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/ruang-lab`, ruanganLab);
      await getRuanganLab(currentPage, rowsPerPage);
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

  const updateRuanganLab = async (id: string, updateRuanganLab: Partial<RuanganLab>) => {
    setLoading(true);
    try {
      const sanitizedData = {
        ...updateRuanganLab,
        jumlah: parseInt(updateRuanganLab.jumlah?.toString() || '0', 10),
        harga: parseInt(updateRuanganLab.harga?.toString() || '0', 10),
      };

      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/ruang-lab/${id}`, sanitizedData);
      await getRuanganLab(currentPage, rowsPerPage);
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

  const deleteRuanganLab = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/ruang-lab?ids=${encodeURIComponent(JSON.stringify(ids))}`
      );
      await getRuanganLab(currentPage, rowsPerPage);
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
    getRuanganLab();
  }, [getRuanganLab]);

  return {
    ruanganLab,
    loading,
    error,
    totalData,
    getRuanganLab,
    currentPage,
    rowsPerPage,
    setCurrentPage,
    setRowsPerPage,
    getRuanganLabById,
    postRuanganLab,
    updateRuanganLab,
    deleteRuanganLab,
  };
};
