'use client';

import React, { createContext, useContext, useState } from 'react';

interface FasilitasData {
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

interface FasilitasContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  gedungFilter: string;
  setGedungFilter: (value: string) => void;
  lantaiFilter: string | number;
  setLantaiFilter: (value: string | number) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  fasilitas: FasilitasData[]; // Add proper type
  filteredFasilitas: FasilitasData[]; // Add proper type
  setFilteredFasilitas: (value: FasilitasData[]) => void;
}

const FasilitasContext = createContext<FasilitasContextType | undefined>(undefined);

export const FasilitasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [gedungFilter, setGedungFilter] = useState<string>('All');
  const [lantaiFilter, setLantaiFilter] = useState<string | number>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fasilitas, setFasilitas] = useState<FasilitasData[]>([]);
  const [filteredFasilitas, setFilteredFasilitas] = useState<FasilitasData[]>([]);

  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <FasilitasContext.Provider
      value={{
        departemenFilter,
        setDepartemenFilter,
        gedungFilter,
        setGedungFilter,
        lantaiFilter,
        setLantaiFilter,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery: handleSearchQuery,
        fasilitas,
        filteredFasilitas,
        setFilteredFasilitas,
      }}
    >
      {children}
    </FasilitasContext.Provider>
  );
};

export const useFasilitasFilter = () => {
  const context = useContext(FasilitasContext);
  if (context === undefined) {
    throw new Error('useFasilitasFilter must be used within a FasilitasProvider');
  }
  return context;
};
