import React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { RuanganProvider } from '@/contexts/RuanganContext';
import AsetRuanganTable from '@/components/aset/ruangan/RuanganTable';
import TableHeader from '@/components/aset/ruangan/TableHeader';

export const metadata = {
  title: `Aset Ruangan | Aset | ${config.site.name}`,
  description: 'Data aset ruangan ini berfungsi untuk mengelola data aset ruangan ',
} satisfies Metadata;
function AsetRuanganPage() {
  return (
    <RuanganProvider>
      <TableHeader />
      <AsetRuanganTable />
    </RuanganProvider>
  );
}

export default AsetRuanganPage;
