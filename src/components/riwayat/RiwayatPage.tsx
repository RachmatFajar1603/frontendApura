'use client';

import { useEffect, useState } from 'react';
import { Box, Chip, TablePagination } from '@mui/material';

import { usePeminjaman } from '@/lib/pemrosesan/peminjaman';
import { usePenyewaan } from '@/lib/pemrosesan/penyewaan';
import { usePerbaikan } from '@/lib/pemrosesan/perbaikan';
import { useUsers } from '@/hooks/use-user';

import HistoryCardList from './HistoryCardList';
import TableHeader from './TableHeader';

interface HistoryItem {
  id: string;
  type: 'Peminjaman' | 'Penyewaan' | 'Perbaikan';
  namaPeminjam?: { namaLengkap: string };
  namaPenyewa?: { namaLengkap: string };
  namaPengaju?: { namaLengkap: string };
  tujuan?: string;
  deskripsi?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  statusAset: string;
  statusPengajuan: string;
  asetName: string;
  departemenName?: string;
  totalBiaya?: number;
  kondisiAset?: string;
}

const getAsetName = (item: any) => {
  if (item.ruangUmumId) return item.RuanganUmum?.nama || 'Ruang Umum';
  if (item.ruangLabId) return item.RuangLab?.nama || 'Ruang Lab';
  if (item.alatId) return item.Alat?.nama || 'Alat';
  return 'Unknown Aset';
};

const Riwayat: React.FC = () => {
  const { peminjaman, getPeminjaman } = usePeminjaman();
  const { penyewaan, getPenyewaan } = usePenyewaan();
  const { perbaikan, getPerbaikan } = usePerbaikan();

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredHistoryItems, setFilteredHistoryItems] = useState<HistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [typeFilter, setTypeFilter] = useState<'All' | 'Peminjaman' | 'Penyewaan' | 'Perbaikan'>('All');
  const [statusPengajuanFilter, setStatusPengajuanFilter] = useState<string>('All');
  const [statusAsetFilter, setStatusAsetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { user } = useUsers();

  useEffect(() => {
    const combineHistory = () => {
      const peminjamanHistory = peminjaman
        .filter((p) => p.namaPeminjam?.id === user?.id) // Filter by user ID
        .map((p) => ({
          id: p.id,
          type: 'Peminjaman' as const,
          namaPeminjam: p.namaPeminjam,
          tujuan: p.tujuan,
          tanggalMulai: p.tanggalMulai,
          tanggalSelesai: p.tanggalSelesai,
          statusAset: p.statusAset,
          statusPengajuan: p.statusPengajuan,
          asetName: getAsetName(p),
          departemenName: p.Departemen?.nama,
        }));

      const penyewaanHistory = penyewaan
        .filter((s) => s.namaPenyewa?.id === user?.id) // Filter by user ID
        .map((s) => ({
          id: s.id,
          type: 'Penyewaan' as const,
          namaPenyewa: s.namaPenyewa,
          tujuan: s.tujuan,
          tanggalMulai: s.tanggalMulai,
          tanggalSelesai: s.tanggalSelesai,
          statusAset: s.statusAset,
          statusPengajuan: s.statusPengajuan,
          asetName: getAsetName(s),
          departemenName: s.Departemen?.nama,
          totalBiaya: s.totalBiaya,
        }));

      const perbaikanHistory = perbaikan
        .filter((r) => r.namaPengaju?.id === user?.id) // Filter by user ID
        .map((r) => ({
          id: r.id,
          type: 'Perbaikan' as const,
          namaPengaju: r.namaPengaju,
          deskripsi: r.deskripsi,
          statusAset: r.statusAset,
          statusPengajuan: r.statusPengajuan,
          asetName: getAsetName(r),
          departemenName: r.Departemen?.nama,
          kondisiAset: r.kondisiAset,
        }));

      const combinedHistory = [...peminjamanHistory, ...penyewaanHistory, ...perbaikanHistory].sort((a, b) => {
        const dateA = a.type === 'Perbaikan' ? new Date().getTime() : new Date(a.tanggalMulai).getTime();
        const dateB = b.type === 'Perbaikan' ? new Date().getTime() : new Date(b.tanggalMulai).getTime();
        return dateB - dateA;
      });

      setHistoryItems(combinedHistory);
    };

    combineHistory();
  }, [peminjaman, penyewaan, perbaikan, user?.id]);

  useEffect(() => {
    let filtered = historyItems;

    // Type filter
    if (typeFilter !== 'All') {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Status Pengajuan filter
    if (statusPengajuanFilter !== 'All') {
      filtered = filtered.filter((item) => item.statusPengajuan === statusPengajuanFilter);
    }

    // Status Aset filter
    if (statusAsetFilter !== 'All') {
      filtered = filtered.filter((item) => item.statusAset === statusAsetFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.tujuan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.type === 'Peminjaman'
            ? item.namaPeminjam?.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase())
            : item.namaPenyewa?.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.asetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.departemenName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredHistoryItems(filtered);
    setCurrentPage(0);
  }, [historyItems, typeFilter, statusPengajuanFilter, statusAsetFilter, searchQuery]);

  const getUniqueStatusValues = (key: 'statusPengajuan' | 'statusAset') => {
    return ['All', ...Array.from(new Set(historyItems.map((item) => item[key])))];
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
    getPeminjaman(newPage + 1, rowsPerPage / 3);
    getPenyewaan(newPage + 1, rowsPerPage / 3);
    getPerbaikan(newPage + 1, rowsPerPage / 3);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    getPeminjaman(1, newRowsPerPage / 3);
    getPenyewaan(1, newRowsPerPage / 3);
    getPerbaikan(1, newRowsPerPage / 3);
  };

  const renderStatusChip = (status: string, type: 'statusAset' | 'statusPengajuan') => {
    const colorMap: {
      statusAset: Record<string, { color: string; bgColor: string }>;
      statusPengajuan: Record<string, { color: string; bgColor: string }>;
    } = {
      statusAset: {
        SEDANG_DIPINJAM: { color: '#388e3c', bgColor: '#e8f5e9' },
        SEDANG_DISEWA: { color: '#388e3c', bgColor: '#e8f5e9' },
        PENYEWAAN_GAGAL: { color: '#d32f2f', bgColor: '#ffebee' },
        PEMINJAMAN_GAGAL: { color: '#d32f2f', bgColor: '#ffebee' },
      },
      statusPengajuan: {
        DISETUJUI: { color: '#388e3c', bgColor: '#e8f5e9' },
        DITOLAK: { color: '#d32f2f', bgColor: '#ffebee' },
      },
    };

    const { color, bgColor } = colorMap[type][status] || { color: '#ff9800', bgColor: '#fff3e0' };

    return (
      <Chip
        label={status}
        size="small"
        sx={{
          color,
          backgroundColor: bgColor,
          fontWeight: 'bold',
        }}
      />
    );
  };
  return (
    <>
      <TableHeader
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusPengajuanFilter={statusPengajuanFilter}
        setStatusPengajuanFilter={setStatusPengajuanFilter}
        statusAsetFilter={statusAsetFilter}
        setStatusAsetFilter={setStatusAsetFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        getUniqueStatusValues={getUniqueStatusValues} // Pass function to TableHeader
      />
      <HistoryCardList
        filteredHistoryItems={filteredHistoryItems.slice(
          currentPage * rowsPerPage,
          currentPage * rowsPerPage + rowsPerPage
        )}
        renderStatusChip={renderStatusChip}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 3,
        }}
      >
        <TablePagination
          component="div"
          count={filteredHistoryItems.length}
          page={currentPage}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    </>
  );
};

export default Riwayat;
