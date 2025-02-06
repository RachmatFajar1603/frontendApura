import React from 'react';
import axios from 'axios';
import api from '../api';

export interface Gedung {
  id: string;
  nama: string;
}

export const useGedung = () => {
  const [gedung, setGedung] = React.useState<Gedung[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  const getGedung = React.useCallback(async (page = currentPage, rows = rowsPerPage) =>  {
    setLoading(true);
    try {
      // const token = localStorage.getItem('custom-auth-token');
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/gedung?page=${page}&rows=${rows}`);
      setGedung(response.data.content.entries);
    } catch (err) {
      setError('Failed to fetch gedung');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    getGedung();
  }, [getGedung]);

  return { gedung, loading, error, getGedung };
};