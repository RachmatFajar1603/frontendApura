'use client';

import React, { createContext, useContext, useState } from 'react';

interface PenyewaanData {
  id: string;
  namaPenyewaId: string;
  namaPenyetujuSewaId: string;
  tujuan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jamMulai?: string;
  jamSelesai?: string;
  statusAset: string;
  statusPengajuan: string;
  created_at?: string;
  updataed_at?: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: any;
  departemenId?: string;
  Departemen?: any;
  namaPenyewa?: any;
  namaPenyetuju?: any;
  RuanganUmum?: any;
  RuangLab?: any;
  Alat?: any;
  Fasilitas?: any;
  jumlahYangDisewa?: any;
  totalBiaya?: any;
  buktiPembayaran?: any;
  ttdPenyewa?: any;
  deskripsiPenolakan?: any;
  fasilitasPenyewaan?: any;
}

interface PenyewaanContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  statusPengajuanFilter: string;
  setStatusPengajuanFilter: (value: string) => void;
  statusAsetFilter: string;
  setStatusAsetFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  penyewaan: PenyewaanData[]; // Add proper type
  filteredPenyewaan: PenyewaanData[]; // Add proper type
  setFilteredPenyewaan: (value: PenyewaanData[]) => void;
}

const PenyewaanContext = createContext<PenyewaanContextType | undefined>(undefined);

export const PenyewaanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [statusPengajuanFilter, setStatusPengajuanFilter] = useState<string>('All');
  const [statusAsetFilter, setStatusAsetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [penyewaan, setPenyewaan] = useState<PenyewaanData[]>([]);
  const [filteredPenyewaan, setFilteredPenyewaan] = useState<PenyewaanData[]>([]);

  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <PenyewaanContext.Provider
      value={{
        departemenFilter,
        setDepartemenFilter,
        statusPengajuanFilter,
        setStatusPengajuanFilter,
        statusAsetFilter,
        setStatusAsetFilter,
        searchQuery,
        setSearchQuery: handleSearchQuery,
        penyewaan,
        filteredPenyewaan,
        setFilteredPenyewaan,
      }}
    >
      {children}
    </PenyewaanContext.Provider>
  );
};

export const usePenyewaanFilter = () => {
  const context = useContext(PenyewaanContext);
  if (context === undefined) {
    throw new Error('usePenyewaan must be used within a PenyewaanProvider');
  }
  return context;
};
