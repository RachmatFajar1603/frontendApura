'use client';

import React, { createContext, useContext, useState } from 'react';

interface PerbaikanData {
  id: string;
  namaPenyetujuPerbaikanId: string;
  namaPengajuId: string;
  ruangUmumId?: any;
  ruangLabId?: any;
  alatId?: any;
  fasilitasId?: any;
  deskripsi: string;
  kondisiAset: string;
  departemenId?: string;
  statusAset: string;
  statusPengajuan: string;
  Departemen?: any;
  RuanganUmum?: any;
  RuangLab?: any;
  Alat?: any;
  Fasilitas?: any;
  namaPengaju?: any;
  namaPenyetujuPerbaikan?: any;
  deskripsiPenolakan?: any;
  jumlahYangDiPerbaiki?: any;
  jumlahAsetYangTersedia?: any;
}

interface PerbaikanContextType {
  departemenFilter: string;
  setDepartemenFilter: (value: string) => void;
  statusPengajuanFilter: string;
  setStatusPengajuanFilter: (value: string) => void;
  statusAsetFilter: string;
  setStatusAsetFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  perbaikan: PerbaikanData[]; // Add proper type
  filteredPerbaikan: PerbaikanData[]; // Add proper type
  setFilteredPerbaikan: (value: PerbaikanData[]) => void;
}

const PerbaikanContext = createContext<PerbaikanContextType | undefined>(undefined);

export const PerbaikanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departemenFilter, setDepartemenFilter] = useState<string>('All');
  const [statusPengajuanFilter, setStatusPengajuanFilter] = useState<string>('All');
  const [statusAsetFilter, setStatusAsetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [perbaikan, setPerbaikan] = useState<PerbaikanData[]>([]);
  const [filteredPerbaikan, setFilteredPerbaikan] = useState<PerbaikanData[]>([]);

  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
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
        perbaikan,
        filteredPerbaikan,
        setFilteredPerbaikan,
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
