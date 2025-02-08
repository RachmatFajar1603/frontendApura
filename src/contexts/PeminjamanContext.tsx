'use client';

import React, { createContext, useContext, useState } from 'react';

interface PeminjamanData {
  jumlahYangDipinjam: number;
  id: string;
  namaPeminjamId: string;
  namaPenyetujuId: string;
  tujuan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusAset: string;
  statusPengajuan: string;
  created_at?: string;
  updated_at?: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: any;
  departemenId?: string;
  Departemen?: any;
  namaPeminjam?: any;
  namaPenyetuju?: any;
  RuanganUmum?: any;
  RuangLab?: any;
  Alat?: any;
  Fasilitas?: any;
  ttdPeminjam?: any;
  deskripsiPenolakan?: any;
  fasilitasPeminjaman?: any;
}

interface PeminjamanContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  statusPengajuanFilter: string;
  setStatusPengajuanFilter: (value: string) => void;
  statusAsetFilter: string;
  setStatusAsetFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  peminjaman: PeminjamanData[]; // Add proper type
  filteredPeminjaman: PeminjamanData[]; // Add proper type
  setFilteredPeminjaman: (value: PeminjamanData[]) => void;
}

const PeminjamanContext = createContext<PeminjamanContextType | undefined>(undefined);

export const PeminjamanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [statusPengajuanFilter, setStatusPengajuanFilter] = useState<string>('All');
  const [statusAsetFilter, setStatusAsetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [peminjaman, setPeminjaman] = useState<PeminjamanData[]>([]);
  const [filteredPeminjaman, setFilteredPeminjaman] = useState<PeminjamanData[]>([]);

  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <PeminjamanContext.Provider
      value={{
        departemenFilter,
        setDepartemenFilter,
        statusPengajuanFilter,
        setStatusPengajuanFilter,
        statusAsetFilter,
        setStatusAsetFilter,
        searchQuery,
        setSearchQuery: handleSearchQuery,
        peminjaman,
        filteredPeminjaman,
        setFilteredPeminjaman,
      }}
    >
      {children}
    </PeminjamanContext.Provider>
  );
};

export const usePeminjamanFilter = () => {
  const context = useContext(PeminjamanContext);
  if (context === undefined) {
    throw new Error('usePeminjaman must be used within a PeminjamanProvider');
  }
  return context;
};
