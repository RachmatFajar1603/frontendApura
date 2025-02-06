import React from 'react';
import { AxiosError } from 'axios';

import api from '../api';

interface Pengembalian {
  id: string;
  peminjamanId?: string;
  penyewaId?: string;
  userId?: string;
  namaPenyetujuId?: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: any;
  departemenId?: string;
  tanggalPengembalian?: string;
  jumlahPinjamYangDikembalikan?: number;
  jumlahSewaYangDikembalikan?: number;
  tujuan?: string;
  kondisiAset?: string;
  statusAset?: string;
  deskripsiKerusakan?: any;
  denda?: any;
  statusPengembalian?: any;
  Peminjaman?: any;
  Penyewaan?: any;
  namaPenyetuju?: any;
  totalBiaya?: any;
  deskripsiPenolakan?: any;
  fasilitasPengembalian?: any;
}

export const usePengembalian = () => {
  const [pengembalian, setPengembalian] = React.useState<Pengembalian[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [pengembalianById, setPengembalianById] = React.useState<Pengembalian | null>(null);

  const getPengembalian = React.useCallback(
    async (page = currentPage, rows = rowsPerPage) => {
      setLoading(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/pengembalian?page=${page}&rows=${rows}`);
        const fetchedData = response.data.content.entries;
        setPengembalian(fetchedData);
        setTotalData(response.data.content.totalData);
        setCurrentPage(page);
        setRowsPerPage(rows);
      } catch (error) {
        setError(error instanceof AxiosError ? error.message : 'An unknown error occured');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, rowsPerPage]
  );

  const getPengembalianById = React.useCallback(async (id: string): Promise<Pengembalian | null> => {
    setLoading(true);
    setError(null); 
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/pengembalian/${id}`);

      if (response.data?.content) {
        setPengembalianById(response.data.content);
        return response.data.content;
      } 
        console.error('Data peminjaman tidak ditemukan');
        setPengembalianById(null);
        return null;
      
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      console.error('Error fetching perbaikan by ID:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const postPengembalian = React.useCallback(
    async (newPengembalian: Pengembalian) => {
      setLoading(true);
      try {
        const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/pengembalian`, newPengembalian);
        await getPengembalian(currentPage, rowsPerPage);
        return response.data;
      } catch (error) {
        setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, rowsPerPage]
  );

  const updatePengembalian = async (id: string, updatedPengembalian: Partial<Pengembalian>) => {
    setLoading(true);
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/pengembalian/${id}`, updatedPengembalian);
      await getPengembalian(currentPage, rowsPerPage); 
      return response.data;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updatePengembalianStatus = async (id: string, updatePengembalianStatus: Partial<Pengembalian>) => {
    setLoading(true);
    try {
      const response = await api.put(
        `${process.env.NEXT_PUBLIC_API_URL}/pengembalian/${id}/statusPengembalian`,
        updatePengembalianStatus
      );
      await getPengembalian(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deletePengembalian = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/pengembalian?ids=${encodeURIComponent(JSON.stringify(ids))}`
      );
      await getPengembalian(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Update error:', error.response);
        setError(error.message);
      } else if (error instanceof AxiosError) {
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
    getPengembalian(); 
  }, [getPengembalian]);

  return {
    pengembalian,
    loading,
    error,
    totalData,
    currentPage,
    rowsPerPage,
    pengembalianById,
    getPengembalian,
    setPengembalianById,
    setCurrentPage,
    setRowsPerPage,
    deletePengembalian,
    updatePengembalianStatus,
    postPengembalian,
    getPengembalianById,
    updatePengembalian,
  };
};
