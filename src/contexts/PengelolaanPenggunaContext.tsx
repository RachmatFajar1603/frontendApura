'use client';

import React, { createContext, useContext, useState } from 'react';

interface PengelolaanPenggunaContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  pengelolaanPengguna: any[]; // Add proper type
  filteredPengelolaanPengguna: any[]; // Add proper type
  setFilteredPengelolaanPengguna: (value: any[]) => void;
}

const PengelolaanPenggunaContext = createContext<PengelolaanPenggunaContextType | undefined>(undefined);

export const PengelolaanPenggunaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearchQuery = (value: string) => {
    // Trim hanya di awal proses pencarian, bukan menghilangkan semua spasi
    setSearchQuery(value.trimStart());
  };

  return (
    <PengelolaanPenggunaContext.Provider
      value={{
        departemenFilter,
        setDepartemenFilter,
        roleFilter,
        setRoleFilter,
        searchQuery,
        setSearchQuery: handleSearchQuery,
        pengelolaanPengguna: [],
        filteredPengelolaanPengguna: [],
        setFilteredPengelolaanPengguna: () => {},
      }}
    >
      {children}
    </PengelolaanPenggunaContext.Provider>
  );
};

export const usePengelolaanPenggunaFilter = () => {
  const context = useContext(PengelolaanPenggunaContext);
  if (context === undefined) {
    throw new Error('usePengelolaanPenggunaFilter must be used within a PengelolaanPenggunaProvider');
  }
  return context;
};
