'use client';

import React, { createContext, useContext, useState } from 'react';

interface AlatData {
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  shift?: any;
  laboratorium: string;
  pengawasLab?: any;
  departemen?: any;
  gedung?: any;
  qrCode?: string;
}

interface AlatContextType {
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
  alat: AlatData[];
  filteredAlat: AlatData[];
  setFilteredAlat: (value: AlatData[]) => void;
}

const AlatContext = createContext<AlatContextType | undefined>(undefined);

export const AlatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [gedungFilter, setGedungFilter] = useState<string>('All');
  const [lantaiFilter, setLantaiFilter] = useState<string | number>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alat, setAlat] = useState<AlatData[]>([]);
  const [filteredAlat, setFilteredAlat] = useState<AlatData[]>([]);

  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <AlatContext.Provider
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
        alat,
        filteredAlat,
        setFilteredAlat,
      }}
    >
      {children}
    </AlatContext.Provider>
  );
};

export const useAlatFilter = () => {
  const context = useContext(AlatContext);
  if (context === undefined) {
    throw new Error('useAlatFilter must be used within a AlatProvider');
  }
  return context;
};
