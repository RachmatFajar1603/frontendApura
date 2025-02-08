import React from 'react';
import { AxiosError } from 'axios';

import api from '../api';

interface Penyewaan {
  id: string;
  namaPenyewaId: string;
  namaPenyetujuSewaId: string;
  tujuan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jamMulai?: string;
  jamSelesai?: string;
  statusAset: string;
  statusPengajuan: string;
  created_at?: string;
  updataed_at?: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: any;
  departemenId?: string;
  Departemen?: any;
  namaPenyewa?: any;
  namaPenyetuju?: any;
  RuanganUmum?: any;
  RuangLab?: any;
  Alat?: any;
  Fasilitas?: any;
  jumlahYangDisewa?: any;
  totalBiaya?: any;
  buktiPembayaran?: any;
  ttdPenyewa?: any;
  deskripsiPenolakan?: any;
  fasilitasPenyewaan?: any;
}

export const usePenyewaan = () => {
  const [penyewaan, setPenyewaan] = React.useState<Penyewaan[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [penyewaanById, setPenyewaanById] = React.useState<Penyewaan | null>(null);

  const getPenyewaan = React.useCallback(
    async (page = currentPage, rows = totalData) => {
      setLoading(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/penyewaan?page=${page}&rows=${rows}`);
        const fetchedData = response.data.content.entries;
        setPenyewaan(fetchedData);
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

  const getPenyewaanById = React.useCallback(async (id: string): Promise<Penyewaan | null> => {
    setLoading(true);
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/penyewaan/${id}`);

      if (response.data?.content) {
        setPenyewaanById(response.data.content);
        return response.data.content;
      }
      console.error('Data penyewaan tidak ditemukan');
      setPenyewaanById(null);
      return null;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      console.error('Error fetching peminjaman by ID:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const postPenyewaan = React.useCallback(
    async (newPenyewaan: Penyewaan) => {
      setLoading(true);
      try {
        const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/penyewaan`, newPenyewaan);
        await getPenyewaan(currentPage, rowsPerPage);
        return response.data;
      } catch (error) {
        setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, rowsPerPage]
  );

  const updatePenyewaan = async (id: string, updatePenyewaan: Partial<Penyewaan>) => {
    setLoading(true);
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/penyewaan/${id}`, updatePenyewaan);
      await getPenyewaan(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updatePenyewaanStatus = async (id: string, updatePenyewaanStatus: Partial<Penyewaan>) => {
    setLoading(true);
    try {
      const response = await api.put(
        `${process.env.NEXT_PUBLIC_API_URL}/penyewaan/${id}/statusPenyewaan`,
        updatePenyewaanStatus
      );
      await getPenyewaan(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deletePenyewaan = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/penyewaan?ids=${encodeURIComponent(JSON.stringify(ids))}`
      );
      await getPenyewaan(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getPenyewaan();
  }, [getPenyewaan]);

  return {
    penyewaan,
    loading,
    error,
    totalData,
    currentPage,
    rowsPerPage,
    getPenyewaan,
    setCurrentPage,
    setRowsPerPage,
    getPenyewaanById,
    penyewaanById,
    postPenyewaan,
    updatePenyewaan,
    deletePenyewaan,
    updatePenyewaanStatus,
  };
};
