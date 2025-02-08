import React from 'react';
import { AxiosError } from 'axios';

import api from '../api';

interface Peminjaman {
  jumlahYangDipinjam: number;
  id: string;
  namaPeminjamId: string;
  namaPenyetujuId: string;
  tujuan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusAset: string;
  statusPengajuan: string;
  created_at?: string;
  updated_at?: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: any;
  departemenId?: string;
  Departemen?: any;
  namaPeminjam?: any;
  namaPenyetuju?: any;
  RuanganUmum?: any;
  RuangLab?: any;
  Alat?: any;
  Fasilitas?: any;
  ttdPeminjam?: any;
  deskripsiPenolakan?: any;
  fasilitasPeminjaman?: any;
}

export const usePeminjaman = () => {
  const [peminjaman, setPeminjaman] = React.useState<Peminjaman[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [peminjamanById, setPeminjamanById] = React.useState<Peminjaman | null>(null);

  const getPeminjaman = React.useCallback(
    async (page = currentPage, rows = totalData) => {
      setLoading(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/peminjaman?page=${page}&rows=${rows}`);
        const fetchedData = response.data.content.entries;
        setPeminjaman(fetchedData);
        setTotalData(response.data.content.totalData);
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

  const getPeminjamanById = React.useCallback(async (id: string): Promise<Peminjaman | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/peminjaman/${id}`);
      if (response.data?.content) {
        setPeminjamanById(response.data.content);
        return response.data.content;
      }
      console.error('Data peminjaman tidak ditemukan');
      setPeminjamanById(null);
      return null;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      console.error('Error fetching peminjaman by ID:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const postPeminjaman = React.useCallback(
    async (newPeminjaman: Peminjaman) => {
      setLoading(true);
      try {
        const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/peminjaman`, newPeminjaman);
        await getPeminjaman(currentPage, rowsPerPage);
        return response.data;
      } catch (error) {
        setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, rowsPerPage]
  );

  const updatePeminjaman = async (id: string, updatedPeminjaman: Partial<Peminjaman>) => {
    setLoading(true);
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/peminjaman/${id}`, updatedPeminjaman);
      await getPeminjaman(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updatePeminjamanStatus = async (id: string, updatePeminjamanStatus: Partial<Peminjaman>) => {
    setLoading(true);
    try {
      const response = await api.put(
        `${process.env.NEXT_PUBLIC_API_URL}/peminjaman/${id}/statusPeminjaman`,
        updatePeminjamanStatus
      );
      await getPeminjaman(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deletePeminjaman = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/peminjaman?ids=${encodeURIComponent(JSON.stringify(ids))}`
      );
      await getPeminjaman(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Update error:', error.response);
        setError(error.message);
      } else {
        console.error('Unexpected error:', error);
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getPeminjaman();
  }, [getPeminjaman]);

  return {
    peminjaman,
    loading,
    error,
    totalData,
    getPeminjaman,
    getPeminjamanById,
    postPeminjaman,
    currentPage,
    rowsPerPage,
    setCurrentPage,
    setRowsPerPage,
    updatePeminjaman,
    deletePeminjaman,
    peminjamanById,
    updatePeminjamanStatus,
  };
};
