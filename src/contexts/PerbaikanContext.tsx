'use client';

import React, { createContext, useContext, useState } from 'react';

interface PerbaikanContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  statusPengajuanFilter: string;
  setStatusPengajuanFilter: (value: string) => void;
  statusAsetFilter: string;
  setStatusAsetFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  perbaikan: any[]; // Add proper type
  filteredPerbaikan: any[]; // Add proper type
  setFilteredPerbaikan: (value: any[]) => void;
}

const PerbaikanContext = createContext<PerbaikanContextType | undefined>(undefined);

export const PerbaikanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [statusPengajuanFilter, setStatusPengajuanFilter] = useState<string>('All');
  const [statusAsetFilter, setStatusAsetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearchQuery = (value: string) => {
    // Trim hanya di awal proses pencarian, bukan menghilangkan semua spasi
    setSearchQuery(value.trimStart());
  };

  return (
    <PerbaikanContext.Provider
      value={{
        departemenFilter,
        setDepartemenFilter,
        statusPengajuanFilter,
        setStatusPengajuanFilter,
        statusAsetFilter,
        setStatusAsetFilter,
        searchQuery,
        setSearchQuery: handleSearchQuery,
        perbaikan: [],
        filteredPerbaikan: [],
        setFilteredPerbaikan: () => {},
      }}
    >
      {children}
    </PerbaikanContext.Provider>
  );
};

export const usePerbaikanFilter = () => {
  const context = useContext(PerbaikanContext);
  if (context === undefined) {
    throw new Error('usePerbaikan must be used within a PerbaikanProvider');
  }
  return context;
};
