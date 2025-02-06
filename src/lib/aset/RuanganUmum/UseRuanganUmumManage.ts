import React from 'react';
import { AxiosError } from 'axios';

import api from '@/lib/api';

interface RuanganUmumManage {
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
}

export const useRuanganUmumManage = () => {
  const [ruanganUmumManage, setRuanganUmumManage] = React.useState<RuanganUmumManage[]>([]);
  const [loadingRuanganUmumManage, setLoadingRuanganUmumManage] = React.useState<boolean>(true);
  const [errorRuanganUmumManage, setErrorRuanganUmumManage] = React.useState<string | null>(null);
  const [totalDataRuanganUmumManage, setTotalDataRuanganUmumManage] = React.useState<number>(0);
  const [currentPageRuanganUmumManage, setCurrentPageRuanganUmumManage] = React.useState<number>(1);
  const [rowsPerPageRuanganUmumManage, setRowsPerPageRuanganUmumManage] = React.useState<number>(10);

  const getRuanganUmumManage = React.useCallback(
    async (page = currentPageRuanganUmumManage, rows = rowsPerPageRuanganUmumManage) => {
      setLoadingRuanganUmumManage(true);
      try {
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_API_URL}/ruangan-umum/manage?page=${page}&rows=${rows}`
        );
        const data = response.data;

        const entries = data.content.entries || data.content.ruanganUmum?.entries;
        const totalData = data.content.totalData || data.content.ruanganUmum?.totalData;

        setRuanganUmumManage(entries);
        setTotalDataRuanganUmumManage(totalData);
        setCurrentPageRuanganUmumManage(page);
        setRowsPerPageRuanganUmumManage(rows);
        return response.data;
      } catch (error) {
        setErrorRuanganUmumManage(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoadingRuanganUmumManage(false);
      }
    },
    [currentPageRuanganUmumManage, rowsPerPageRuanganUmumManage]
  );

  React.useEffect(() => {
    getRuanganUmumManage();
  }, [getRuanganUmumManage]);

  return {
    ruanganUmumManage,
    loadingRuanganUmumManage,
    errorRuanganUmumManage,
    getRuanganUmumManage,
    totalDataRuanganUmumManage,
    currentPageRuanganUmumManage,
    rowsPerPageRuanganUmumManage,
    setCurrentPageRuanganUmumManage,
    setRowsPerPageRuanganUmumManage,
  };
};
