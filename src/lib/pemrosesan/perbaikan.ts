import React from 'react';
import { AxiosError } from 'axios';

import api from '../api';

interface Perbaikan {
  id: string;
  namaPenyetujuPerbaikanId: string;
  namaPengajuId: string;
  ruangUmumId?: any;
  ruangLabId?: any;
  alatId?: any;
  fasilitasId?: any;
  deskripsi: string;
  kondisiAset: string;
  departemenId?: string;
  statusAset: string;
  statusPengajuan: string;
  Departemen?: any;
  RuanganUmum?: any;
  RuangLab?: any;
  Alat?: any;
  Fasilitas?: any;
  namaPengaju?: any;
  namaPenyetujuPerbaikan?: any;
  deskripsiPenolakan?: any;
  jumlahYangDiPerbaiki?: any;
  jumlahAsetYangTersedia?: any;
}

export const usePerbaikan = () => {
  const [perbaikan, setPerbaikan] = React.useState<Perbaikan[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [perbaikanById, setPerbaikanById] = React.useState<Perbaikan | null>(null);

  const getPerbaikan = React.useCallback(
    async (page = currentPage, rows = totalData) => {
      setLoading(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/perbaikan?page=${page}&rows=${rows}`);
        const fetchedData = response.data.content.entries;
        setPerbaikan(fetchedData);
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

  const getPerbaikanById = React.useCallback(async (id: string): Promise<Perbaikan | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/perbaikan/${id}`);

      if (response.data?.content) {
        setPerbaikanById(response.data.content);
        return response.data.content; 
      } 
        console.error('Data peminjaman tidak ditemukan');
        setPerbaikanById(null);
        return null;
      
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      console.error('Error fetching perbaikan by ID:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const postPerbaikan = React.useCallback(
    async (newPerbaikan: Perbaikan) => {
      setLoading(true);
      try {
        const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/perbaikan`, newPerbaikan);
        await getPerbaikan(currentPage, rowsPerPage);
        return response.data;
      } catch (error) {
        setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, rowsPerPage]
  );

  const updatePerbaikan = async (id: string, updatedPerbaikan: Partial<Perbaikan>) => {
    setLoading(true);
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/perbaikan/${id}`, updatedPerbaikan);
      await getPerbaikan(currentPage, rowsPerPage); 
      return response.data;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updatePerbaikanStatus = async (id: string, updatePerbaikanStatus: Partial<Perbaikan>) => {
    setLoading(true);
    try {
      const response = await api.put(
        `${process.env.NEXT_PUBLIC_API_URL}/perbaikan/${id}/status`,
        updatePerbaikanStatus
      );
      await getPerbaikan(currentPage, rowsPerPage);
      return response.data;
    } catch (error) {
      setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deletePerbaikan = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/perbaikan?ids=${encodeURIComponent(JSON.stringify(ids))}`
      );
      await getPerbaikan(currentPage, rowsPerPage);
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
    getPerbaikan(); 
  }, [getPerbaikan]);

  return {
    perbaikan,
    loading,
    error,
    totalData,
    getPerbaikan,
    postPerbaikan,
    currentPage,
    rowsPerPage,
    setCurrentPage,
    setRowsPerPage,
    updatePerbaikanStatus,
    deletePerbaikan,
    getPerbaikanById,
    updatePerbaikan,
    perbaikanById,
  };
};
