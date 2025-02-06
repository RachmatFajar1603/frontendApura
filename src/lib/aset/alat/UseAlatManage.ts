import React from 'react';
import api from '@/lib/api';

interface AlatManage {
  id: string;
  kode: string;
  nama: string;
  departemenId: string;
  gedungId: string;
  lantai: number;
  harga?: string;
  statusAset: string;
  jumlah: number;
  created_at?: string;
  updated_at?: string;
  shift?: any;
  shiftId?: string;
  laboratorium: string;
  pengawasLab?: any;
  pengawasLabId?: string;
}

interface FilterParams {
  page?: number;
  rows?: number;
  searchFilters?: Record<string, any>;
  filters?: Record<string, any>;
}

export const useAlatManage = () => {
  const [alatManage, setAlatManage] = React.useState<AlatManage[]>([]);
  const [loadingAlatManage, setLoadingAlatManage] = React.useState(true);
  const [errorAlatManage, setErrorAlatManage] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    totalData: 0,
    totalPage: 1,
    currentPage: 1,
    rowsPerPage: 10,
  });

  const [filters, setFilters] = React.useState<{
    search: Record<string, any>;
    exact: Record<string, any>;
  }>({
    search: {},
    exact: {},
  });

  // Build query parameters dengan handling default values
  const buildQueryParams = (params: FilterParams) => {
    const query = new URLSearchParams({
      page: params.page?.toString() || '1',
      rows: params.rows?.toString() || '10',
      searchFilters: JSON.stringify(params.searchFilters || {}),
      filters: JSON.stringify(params.filters || {}),
    });

    return query.toString();
  };

  const getAlatManage = React.useCallback(
    async (params?: Partial<FilterParams>) => {
      setLoadingAlatManage(true);
      setErrorAlatManage(null);
      
      try {
        const mergedParams = {
          page: pagination.currentPage,
          rows: pagination.rowsPerPage,
          searchFilters: filters.search,
          filters: filters.exact,
          ...params,
        };
  
        const queryParams = buildQueryParams(mergedParams);
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/alat/manage?${queryParams}`);
  
        // Pertahankan handling struktur response
        const content = response.data?.content || {};
        const entries = content.alat?.entries || content.entries || [];
        const totalData = content.alat?.totalData ?? content.totalData ?? 0;
        const totalPage = content.alat?.totalPage ?? content.totalPage ?? 1;
  
        setAlatManage(entries);
        setPagination(prev => ({
          ...prev,
          totalData,
          totalPage,
          currentPage: mergedParams.page || 1,
          rowsPerPage: mergedParams.rows || 10,
        }));
  
        return response.data;
      } catch (error) {
        // ... (bagian error handling tetap sama)
      } finally {
        setLoadingAlatManage(false);
      }
    },
    [pagination.currentPage, pagination.rowsPerPage, filters]
  );

  // Handler untuk pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    getAlatManage({ page: newPage });
  };

  // Handler untuk rows per page
  const handleRowsPerPageChange = (newRows: number) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: newRows,
      currentPage: 1,
    }));
    getAlatManage({ rows: newRows, page: 1 });
  };

  // Handler untuk filter
  const handleFilter = (type: 'search' | 'exact', field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    getAlatManage({ 
      [type === 'search' ? 'searchFilters' : 'filters']: { [field]: value },
      page: 1 
    });
  };

  // Handler reset semua filter
  const resetFilters = () => {
    setFilters({ search: {}, exact: {} });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    getAlatManage({ searchFilters: {}, filters: {}, page: 1 });
  };

  // Auto-fetch saat perubahan pagination atau filter
  React.useEffect(() => {
    getAlatManage();
  }, [pagination.currentPage, pagination.rowsPerPage, filters]);

  return {
    alatManage,
    loadingAlatManage,
    errorAlatManage,
    pagination,
    filters,
    getAlatManage,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilter,
    resetFilters,
  };
};