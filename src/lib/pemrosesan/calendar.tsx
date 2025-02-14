import React from 'react';

import api from '../api';

interface Calendar {
  id: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusPengajuan: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  departemenId?: string;
}

export const useCalendar = () => {
  const [calendarPeminjaman, setCalendarPeminjaman] = React.useState<Calendar[]>([]);
  const [loadingCalendarPeminjaman, setLoadingCalendarPeminjaman] = React.useState<boolean>(false);
  const [errorCalendarPeminjaman, setErrorCalendarPeminjaman] = React.useState<Error | null>(null);

  const [calendarPenyewaan, setCalendarPenyewaan] = React.useState<Calendar[]>([]);
  const [loadingCalendarPenyewaan, setLoadingCalendarPenyewaan] = React.useState<boolean>(false);
  const [errorCalendarPenyewaan, setErrorCalendarPenyewaan] = React.useState<Error | null>(null);

  const getCalendarPeminjaman = React.useCallback(async () => {
    setLoadingCalendarPeminjaman(true);
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/peminjaman/kalender`);
      const fetchedData = response.data.content.entries;
      setCalendarPeminjaman(fetchedData);
      setLoadingCalendarPeminjaman(false);
    } catch (error) {
      setErrorCalendarPeminjaman(error as Error);
      setLoadingCalendarPeminjaman(false);
    } finally {
      setLoadingCalendarPeminjaman(false);
    }
  }, []);

  const getCalendarPenyewaan = React.useCallback(async () => {
    setLoadingCalendarPenyewaan(true);
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/penyewaan/kalender`);
      const fetchedData = response.data.content.entries;
      setCalendarPenyewaan(fetchedData);
      setLoadingCalendarPenyewaan(false);
    } catch (error) {
      setErrorCalendarPenyewaan(error as Error);
      setLoadingCalendarPenyewaan(false);
    } finally {
      setLoadingCalendarPenyewaan(false);
    }
  }, []);

  React.useEffect(() => {
    getCalendarPeminjaman();
    getCalendarPenyewaan();
  }, [getCalendarPeminjaman, getCalendarPenyewaan]);
  return {
    calendarPeminjaman,
    loadingCalendarPeminjaman,
    errorCalendarPeminjaman,
    getCalendarPeminjaman,
    calendarPenyewaan,
    loadingCalendarPenyewaan,
    errorCalendarPenyewaan,
    getCalendarPenyewaan,
  };
};
