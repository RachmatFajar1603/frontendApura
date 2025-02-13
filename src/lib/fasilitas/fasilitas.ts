import React from 'react';
import { AxiosError } from 'axios';

import api from '../api';

export interface Fasilitas {
  jumlahDisewa?: any;
  jumlahDipinjam?: any;
  assetId: string;
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: number;
  statusAset: string;
  jumlah: number;
  departemen?: any;
  gedung?: any;
}

export const useFasilitas = () => {
  const [fasilitas, setFasilitas] = React.useState<Fasilitas[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  const getFasilitas = React.useCallback(
    async (page = currentPage, rows = rowsPerPage) => {
      setLoading(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/fasilitas?page=${page}&rows=${rows}`);
        const data = response.data;
        setFasilitas(data.content.entries);
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

  const postFasilitas = async (values: Fasilitas) => {
    setLoading(true);
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/fasilitas`, values);
      await getFasilitas(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      console.error(error);
      return error;
    } finally {
      setLoading(false);
    }
    [currentPage, rowsPerPage];
  };

  const updateFasilitas = async (id: string, updateFasilitas: Partial<Fasilitas>) => {
    setLoading(true);
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/fasilitas/${id}`, updateFasilitas);
      await getFasilitas(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      console.error(error);
      return error;
    } finally {
      setLoading(false);
    }
  };

  const deleteFasilitas = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/fasilitas?ids=${encodeURIComponent(JSON.stringify(ids))}`
      );
      await getFasilitas(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      console.error(error);
      return error;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getFasilitas();
  }, [getFasilitas]);

  return {
    fasilitas,
    loading,
    error,
    totalData,
    getFasilitas,
    currentPage,
    rowsPerPage,
    setCurrentPage,
    setRowsPerPage,
    postFasilitas,
    updateFasilitas,
    deleteFasilitas,
  };
};
