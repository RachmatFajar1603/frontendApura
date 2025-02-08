import React from 'react';
import { AxiosError } from 'axios';

import api from '@/lib/api';

interface RuanganLabManage {
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
  departemen?: any;
  gedung?: any;
}

export const useRuanganLabManage = () => {
  const [ruanganLabManage, setRuanganLabManage] = React.useState<RuanganLabManage[]>([]);
  const [loadingRuanganLabManage, setLoadingRuanganLabManage] = React.useState<boolean>(true);
  const [errorRuanganLabManage, setErrorRuanganLabManage] = React.useState<string | null>(null);
  const [totalDataRuanganLabManage, setTotalDataRuanganLabManage] = React.useState<number>(0);
  const [currentPageRuanganLabManage, setCurrentPageRuanganLabManage] = React.useState<number>(1);
  const [rowsPerPageRuanganLabManage, setRowsPerPageRuanganLabManage] = React.useState<number>(10);

  const getRuanganLabManage = React.useCallback(
    async (page = currentPageRuanganLabManage, rows = totalDataRuanganLabManage) => {
      setLoadingRuanganLabManage(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/ruang-lab/manage?page=${page}&rows=${rows}`);
        const data = response.data;

        const entries = data.content.entries || data.content.ruangLab?.entries;
        const totalData = data.content.totalData || data.content.ruangLab?.totalData;

        setRuanganLabManage(entries);
        setTotalDataRuanganLabManage(totalData);
        setCurrentPageRuanganLabManage(page);
        setRowsPerPageRuanganLabManage(rows);
        return response.data;
      } catch (error) {
        setErrorRuanganLabManage(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoadingRuanganLabManage(false);
      }
    },
    [currentPageRuanganLabManage, rowsPerPageRuanganLabManage]
  );

  React.useEffect(() => {
    getRuanganLabManage();
  }, [getRuanganLabManage]);

  return {
    ruanganLabManage,
    loadingRuanganLabManage,
    errorRuanganLabManage,
    getRuanganLabManage,
    totalDataRuanganLabManage,
    currentPageRuanganLabManage,
    rowsPerPageRuanganLabManage,
    setCurrentPageRuanganLabManage,
    setRowsPerPageRuanganLabManage,
  };
};
