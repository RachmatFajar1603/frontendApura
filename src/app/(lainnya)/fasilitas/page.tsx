import React from 'react';
import { type Metadata } from 'next';

import { config } from '@/config';
import { FasilitasProvider } from '@/contexts/FasilitasContext';
import FasilitasTable from '@/components/aset/fasilitas/FasilitasTable';
import TableHeader from '@/components/aset/fasilitas/TableHeader';

export const metadata = {
  title: `Fasilitas | Lainnya | ${config.site.name}`,
  description: 'Data fasilitas ini berfungsi untuk mengelola data fasilitas ',
} satisfies Metadata;

function FasilitasPage() {
  return (
    <FasilitasProvider>
      <TableHeader />
      <FasilitasTable />
    </FasilitasProvider>
  );
}

export default FasilitasPage;
