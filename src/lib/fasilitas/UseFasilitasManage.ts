import React from 'react';

import api from '../api';
import { AxiosError } from 'axios';

interface FasilitasManage {
  assetId: string;
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  departemen?: any;
  gedung?: any;
}

export const useFasilitasManage = () => {
  const [fasilitasManage, setFasilitasManage] = React.useState<FasilitasManage[]>([]);
  const [loadingFasilitasManage, setLoadingFasilitasManage] = React.useState<boolean>(true);
  const [errorFasilitasManage, setErrorFasilitasManage] = React.useState<string | null>(null);
  const [totalDataFasilitasManage, setTotalDataFasilitasManage] = React.useState<number>(0);
  const [currentPageFasilitasManage, setCurrentPageFasilitasManage] = React.useState<number>(1);
  const [rowsPerPageFasilitasManage, setRowsPerPageFasilitasManage] = React.useState<number>(10);

  const getFasilitasManage = React.useCallback(
    async (page = currentPageFasilitasManage, rows = rowsPerPageFasilitasManage) => {
      setLoadingFasilitasManage(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/fasilitas/manage`);
        const data = response.data;

        const entries = data.content.entries;
        const totalData = data.content.totalData;

        setFasilitasManage(entries);
        setTotalDataFasilitasManage(totalData);
        setCurrentPageFasilitasManage(page);
        setRowsPerPageFasilitasManage(rows);
        return data;
      } catch (error) {
        console.error('Error detail:', error);
        if (error instanceof AxiosError) {
          setErrorFasilitasManage(error.response?.data?.message || error.message);
        } else {
          setErrorFasilitasManage('An unknown error occurred');
        }
      } finally {
        setLoadingFasilitasManage(false);
      }
    },
    [currentPageFasilitasManage, rowsPerPageFasilitasManage]
  );

  React.useEffect(() => {
    getFasilitasManage();
  }, [getFasilitasManage]);

  return {
    fasilitasManage,
    loadingFasilitasManage,
    errorFasilitasManage,
    getFasilitasManage,
    totalDataFasilitasManage,
    currentPageFasilitasManage,
    rowsPerPageFasilitasManage,
    setCurrentPageFasilitasManage,
    setRowsPerPageFasilitasManage,
  };
};
