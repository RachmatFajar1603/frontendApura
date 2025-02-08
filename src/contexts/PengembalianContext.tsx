'use client';

import React, { createContext, useContext, useState } from 'react';

interface PengembalianData {
  id: string;
  peminjamanId?: string;
  penyewaId?: string;
  userId?: string;
  namaPenyetujuId?: string;
  ruangUmumId?: string;
  ruangLabId?: string;
  alatId?: string;
  fasilitasId?: any;
  departemenId?: string;
  tanggalPengembalian?: string;
  jumlahPinjamYangDikembalikan?: number;
  jumlahSewaYangDikembalikan?: number;
  tujuan?: string;
  kondisiAset?: string;
  statusAset?: string;
  deskripsiKerusakan?: any;
  denda?: any;
  statusPengembalian?: any;
  Peminjaman?: any;
  Penyewaan?: any;
  namaPenyetuju?: any;
  totalBiaya?: any;
  deskripsiPenolakan?: any;
  fasilitasPengembalian?: any;
}

interface PengembalianContextType {
  statusPengembalianFilter: string;
  setStatusPengembalianFilter: (value: string) => void;
  statusAsetFilter: string;
  setStatusAsetFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  pengembalian: PengembalianData[]; // Add proper type
  filteredPengembalian: PengembalianData[]; // Add proper type
  setFilteredPengembalian: (value: PengembalianData[]) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
}

const PengembalianContext = createContext<PengembalianContextType | undefined>(undefined);

export const PengembalianProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [statusPengembalianFilter, setStatusPengembalianFilter] = useState<string>('All');
  const [statusAsetFilter, setStatusAsetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [pengembalian, setPengembalian] = useState<PengembalianData[]>([]);
  const [filteredPengembalian, setFilteredPengembalian] = useState<PengembalianData[]>([]);

  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <PengembalianContext.Provider
      value={{
        statusPengembalianFilter,
        setStatusPengembalianFilter,
        statusAsetFilter,
        setStatusAsetFilter,
        searchQuery,
        setSearchQuery: handleSearchQuery,
        pengembalian,
        filteredPengembalian,
        setFilteredPengembalian,
        typeFilter,
        setTypeFilter,
      }}
    >
      {children}
    </PengembalianContext.Provider>
  );
};

export const usePengembalianFilter = () => {
  const context = useContext(PengembalianContext);
  if (context === undefined) {
    throw new Error('usePengembalian must be used within a PengembalianProvider');
  }
  return context;
};
