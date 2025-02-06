'use client';

import React, { createContext, useContext, useState } from 'react';

interface PenyewaanContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  statusPengajuanFilter: string;
  setStatusPengajuanFilter: (value: string) => void;
  statusAsetFilter: string;
  setStatusAsetFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  peminjaman: any[]; // Add proper type
  filteredPenyewaan: any[]; // Add proper type
  setFilteredPenyewaan: (value: any[]) => void;
}

const PenyewaanContext = createContext<PenyewaanContextType | undefined>(undefined);

export const PenyewaanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [statusPengajuanFilter, setStatusPengajuanFilter] = useState<string>('All');
  const [statusAsetFilter, setStatusAsetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearchQuery = (value: string) => {
    // Trim hanya di awal proses pencarian, bukan menghilangkan semua spasi
    setSearchQuery(value.trimStart());
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
        peminjaman: [],
        filteredPenyewaan: [],
        setFilteredPenyewaan: () => {},
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
