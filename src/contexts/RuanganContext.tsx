'use client';

import React, { createContext, useContext, useState } from 'react';

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
  filteredData: any[];
  setFilteredData: (data: any[]) => void;
}

const RuanganContext = createContext<RuanganContextType | undefined>(undefined);

export const RuanganProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('ruangan_umum');
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [gedungFilter, setGedungFilter] = useState<string>('All');
  const [lantaiFilter, setLantaiFilter] = useState<string | number>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const handleSearchQuery = (value: string) => {
    // Trim hanya di awal proses pencarian, bukan menghilangkan semua spasi
    setSearchQuery(value.trimStart());
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
        filteredData,
        setFilteredData,
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
