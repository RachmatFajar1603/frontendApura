import React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { AlatProvider } from '@/contexts/AlatContext';
import AlatTable from '@/components/aset/alat/AlatTable';
import TableHeader from '@/components/aset/alat/TableHeader';

export const metadata = {
  title: `Aset Alat | Aset | ${config.site.name}`,
  description: 'Data aset alat ini berfungsi untuk mengelola data aset alat ',
} satisfies Metadata;

function AsetAlatPage() {
  return (
    <AlatProvider>
      <TableHeader />
      <AlatTable />
    </AlatProvider>
  );
}

export default AsetAlatPage;
