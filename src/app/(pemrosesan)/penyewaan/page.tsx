import React from 'react';
import { type Metadata } from 'next';

import { config } from '@/config';
import { PenyewaanProvider } from '@/contexts/PenyewaanContext';
import PenyewaanTable from '@/components/pemrosesan/penyewaan/PenyewaanTable';
import TableHeader from '@/components/pemrosesan/penyewaan/TableHeader';

export const metadata = {
  title: `Penyewaan | Pemrosesan | ${config.site.name}`,
  description:
    'Kelola dan pantau penyewaan aset, ruangan, dan fasilitas dengan mudah. Lihat status pengajuan, filter berdasarkan departemen, dan unduh laporan.',
} satisfies Metadata;

function PenyewaanPage() {
  return (
    <PenyewaanProvider>
      <TableHeader />
      <PenyewaanTable />
    </PenyewaanProvider>
  );
}

export default PenyewaanPage;
