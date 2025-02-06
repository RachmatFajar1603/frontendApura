import React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { PengelolaanPenggunaProvider } from '@/contexts/PengelolaanPenggunaContext';
import PengelolaanPenggunaTable from '@/components/lainnya/pengelolaan-pengguna/PengelolaanPengguna';
import TableHeader from '@/components/lainnya/pengelolaan-pengguna/TableHeader';

export const metadata = {
  title: `Pengelolaan Pengguna | Lainnya | ${config.site.name}`,
  description: 'Data pengelolaan pengguna ini berfungsi untuk mengelola data pengguna yang ada di FMIPA USK',
} satisfies Metadata;

function PengelolaanPenggunaPage() {
  return (
    <PengelolaanPenggunaProvider>
      <TableHeader />
      <PengelolaanPenggunaTable />
    </PengelolaanPenggunaProvider>
  );
}

export default PengelolaanPenggunaPage;
