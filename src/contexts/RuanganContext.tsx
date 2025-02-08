'use client';

import React, { createContext, useContext, useState } from 'react';

interface RuanganData {
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

interface RuanganContextType {
  selectedAsset: string;
  setSelectedAsset: (value: string) => void;
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
  ruangan: RuanganData[];
  filteredRuangan: RuanganData[];
  setFilteredRuangan: (value: RuanganData[]) => void;
}

const RuanganContext = createContext<RuanganContextType | undefined>(undefined);

export const RuanganProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('ruangan_umum');
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [gedungFilter, setGedungFilter] = useState<string>('All');
  const [lantaiFilter, setLantaiFilter] = useState<string | number>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ruangan, setRuangan] = useState<RuanganData[]>([]);
  const [filteredRuangan, setFilteredRuangan] = useState<RuanganData[]>([]);

  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <RuanganContext.Provider
      value={{
        selectedAsset,
        setSelectedAsset,
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
        ruangan,
        filteredRuangan,
        setFilteredRuangan,
      }}
    >
      {children}
    </RuanganContext.Provider>
  );
};

export const useRuanganFilter = () => {
  const context = useContext(RuanganContext);
  if (context === undefined) {
    throw new Error('useRuanganFilter must be used within a RuanganProvider');
  }
  return context;
};
