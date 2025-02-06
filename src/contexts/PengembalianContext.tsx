'use client';

import React, { createContext, useContext, useState } from 'react';

interface PengembalianContextType {
  statusPengembalianFilter: string;
  setStatusPengembalianFilter: (value: string) => void;
  statusAsetFilter: string;
  setStatusAsetFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  pengembalian: any[]; // Add proper type
  filteredPengembalian: any[]; // Add proper type
  setFilteredPengembalian: (value: any[]) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
}

const PengembalianContext = createContext<PengembalianContextType | undefined>(undefined);

export const PengembalianProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [statusPengembalianFilter, setStatusPengembalianFilter] = useState<string>('All');
  const [statusAsetFilter, setStatusAsetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const handleSearchQuery = (value: string) => {
    // Trim hanya di awal proses pencarian, bukan menghilangkan semua spasi
    setSearchQuery(value.trimStart());
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
        pengembalian: [],
        filteredPengembalian: [],
        setFilteredPengembalian: () => {},
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
