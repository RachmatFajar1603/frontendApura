import React from 'react';
import { type Metadata } from 'next';

import { config } from '@/config';
import { PeminjamanProvider } from '@/contexts/PeminjamanContext';
import PeminjamanTable from '@/components/pemrosesan/peminjaman/PeminjamanTable';
import TableHeader from '@/components/pemrosesan/peminjaman/TableHeader';

export const metadata = {
  title: `Peminjaman | Pemrosesan | ${config.site.name}`,
  description:
    'Kelola dan pantau peminjaman aset, ruangan, dan fasilitas dengan mudah. Lihat status pengajuan, filter berdasarkan departemen, dan unduh laporan.',
} satisfies Metadata;

function PeminjamanPage() {
  return (
    <PeminjamanProvider>
      <TableHeader />
      <PeminjamanTable />
    </PeminjamanProvider>
  );
}

export default PeminjamanPage;