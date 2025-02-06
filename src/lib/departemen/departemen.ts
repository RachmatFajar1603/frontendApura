import React from 'react';
import api from '../api';

export interface Departemen {
  id: string;
  nama: string;
}

export const useDepartemen = () => {
  const [departemen, setDepartemen] = React.useState<Departemen[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  const getDepartemen = React.useCallback(async (page = currentPage, rows = rowsPerPage) => {
    setLoading(true);
    try {
      // const token = localStorage.getItem('custom-auth-token');
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/departemen?page=${page}&rows=${rows}`);
      setDepartemen(response.data.content.entries);
    } catch (err) {
      setError('Failed to fetch departemen');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    getDepartemen();
  }, [getDepartemen]);

  return { departemen, loading, error, getDepartemen };
};

