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

interface AlatManage {
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

export const useAlatManage = () => {
  const [alatManage, setAlatManage] = React.useState<AlatManage[]>([]);
  const [loadingAlatManage, setLoadingAlatManage] = React.useState(true);
  const [errorAlatManage, setErrorAlatManage] = React.useState<string | null>(null);
  const [totalDataAlatManage, setTotalDataAlatManage] = React.useState<number>(0);
  const [currentPageAlatManage, setCurrentPageAlatManage] = React.useState<number>(1);
  const [rowsPerPageAlatManage, setRowsPerPageAlatManage] = React.useState<number>(10);

  const getAlatManage = React.useCallback(
    async (page = currentPageAlatManage, rows = totalDataAlatManage) => {
      setLoadingAlatManage(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/alat/manage?page=${page}&rows=${rows}`);
        const data = response.data;

        const entries = data.content.entries || data.content.alat?.entries;
        const totalData = data.content.totalData || data.content.alat?.totalData;

        setAlatManage(entries);
        setTotalDataAlatManage(totalData);
        setCurrentPageAlatManage(page);
        setRowsPerPageAlatManage(rows);
        return response.data;
      } catch (error) {
        setErrorAlatManage(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoadingAlatManage(false);
      }
    },
    [currentPageAlatManage, rowsPerPageAlatManage]
  );

  React.useEffect(() => {
    getAlatManage();
  }, [getAlatManage]);

  return {
    alatManage,
    loadingAlatManage,
    errorAlatManage,
    getAlatManage,
    totalDataAlatManage,
    currentPageAlatManage,
    rowsPerPageAlatManage,
    setCurrentPageAlatManage,
    setRowsPerPageAlatManage,
  };
};
