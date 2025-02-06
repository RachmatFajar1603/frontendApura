'use client';

import React, { createContext, useContext, useState } from 'react';

interface FasilitasContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  gedungFilter: string;
  setGedungFilter: (value: string) => void;
  lantaiFilter: string;
  setLantaiFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  fasilitas: any[]; // Add proper type
  filteredFasilitas: any[]; // Add proper type
  setFilteredFasilitas: (value: any[]) => void;
}

const FasilitasContext = createContext<FasilitasContextType | undefined>(undefined);

export const FasilitasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [gedungFilter, setGedungFilter] = useState<string>('All');
  const [lantaiFilter, setLantaiFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearchQuery = (value: string) => {
    // Trim hanya di awal proses pencarian, bukan menghilangkan semua spasi
    setSearchQuery(value.trimStart());
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
        fasilitas: [],
        filteredFasilitas: [],
        setFilteredFasilitas: () => {},
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
