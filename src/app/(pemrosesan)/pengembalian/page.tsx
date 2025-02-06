import React from 'react';
import { type Metadata } from 'next';
import { config } from '@/config';
import { PengembalianProvider } from '@/contexts/PengembalianContext';
import PengembalianTable from '@/components/pemrosesan/pengembalian/PengembalianTable';
import TableHeader from '@/components/pemrosesan/pengembalian/TableHeader';

export const metadata = { title: `Pengembalian | Pemrosesan | ${config.site.name}`,
description: 'Melakukan pengajuan pengembalian ketika sudah melakukan peminjaman atau penyewaan' } satisfies Metadata;

function PengembalianPage() {
  return (
    <PengembalianProvider>
      <TableHeader />
      <PengembalianTable />
    </PengembalianProvider>
  );
}

export default PengembalianPage;
