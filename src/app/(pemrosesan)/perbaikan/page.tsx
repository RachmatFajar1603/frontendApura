import React from 'react';
import { type Metadata } from 'next';

import { config } from '@/config';
import { PerbaikanProvider } from '@/contexts/PerbaikanContext';
import PerbaikanTable from '@/components/pemrosesan/perbaikan/PerbaikanTable';
import TableHeader from '@/components/pemrosesan/perbaikan/TableHeader';

export const metadata = {
  title: `Perbaikan | Pemrosesan | ${config.site.name}`,
  description: 'Melakukan pengajuan perbaikan aset yang telah mengalami kerusakan',
} satisfies Metadata;

function PerbaikanPage() {
  return (
    <PerbaikanProvider>
      <TableHeader />
      <PerbaikanTable />
    </PerbaikanProvider>
  );
}

export default PerbaikanPage;
