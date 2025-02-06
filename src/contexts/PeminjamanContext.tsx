'use client';

import React, { createContext, useContext, useState } from 'react';

interface PeminjamanContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  statusPengajuanFilter: string;
  setStatusPengajuanFilter: (value: string) => void;
  statusAsetFilter: string;
  setStatusAsetFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  peminjaman: any[]; // Add proper type
  filteredPeminjaman: any[]; // Add proper type
  setFilteredPeminjaman: (value: any[]) => void;
}

const PeminjamanContext = createContext<PeminjamanContextType | undefined>(undefined);

export const PeminjamanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [statusPengajuanFilter, setStatusPengajuanFilter] = useState<string>('All');
  const [statusAsetFilter, setStatusAsetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearchQuery = (value: string) => {
    // Trim hanya di awal proses pencarian, bukan menghilangkan semua spasi
    setSearchQuery(value.trimStart());
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
        peminjaman: [],
        filteredPeminjaman: [],
        setFilteredPeminjaman: () => {},
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
