'use client';

import React, { createContext, useContext, useState } from 'react';

interface PengelolaanPenggunaData {
  id: string;
  namaLengkap: string;
  noIdentitas: string;
  email: string;
  phoneNumber: string;
  role: string;
  departemenId?: string;
  departemen?: any;
  isVerified?: boolean;
}

interface PengelolaanPenggunaContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  pengelolaanPengguna: PengelolaanPenggunaData[]; // Add proper type
  filteredPengelolaanPengguna: PengelolaanPenggunaData[]; // Add proper type
  setFilteredPengelolaanPengguna: (value: PengelolaanPenggunaData[]) => void;
}

const PengelolaanPenggunaContext = createContext<PengelolaanPenggunaContextType | undefined>(undefined);

export const PengelolaanPenggunaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pengelolaanPengguna, setPengelolaanPengguna] = useState<PengelolaanPenggunaData[]>([]);
  const [filteredPengelolaanPengguna, setFilteredPengelolaanPengguna] = useState<PengelolaanPenggunaData[]>([]);

  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
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
        pengelolaanPengguna,
        filteredPengelolaanPengguna,
        setFilteredPengelolaanPengguna,
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
