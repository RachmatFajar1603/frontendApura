'use client';

import React, { createContext, useContext, useState } from 'react';

interface AlatContextType {
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
  alat: any[]; // Add proper type
  filteredAlat: any[]; // Add proper type
  setFilteredAlat: (value: any[]) => void;
}

const AlatContext = createContext<AlatContextType | undefined>(undefined);

export const AlatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        alat: [],
        filteredAlat: [],
        setFilteredAlat: () => {},
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
