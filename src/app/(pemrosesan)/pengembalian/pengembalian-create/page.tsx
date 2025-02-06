import React from 'react';

import { config } from '@/config';
import { type Metadata } from 'next';
import PengembalianForm from '@/components/pemrosesan/pengembalian/pengembalian-create/PengajuanPengembalian';

export const metadata = {
  title: `Pengajuan Pengambalian | Pemrosesan | ${config.site.name}`,
  description: 'Melakukan pengajuan pengembalian setelah menggunakan aset'
} satisfies Metadata;

function Page() {
  return <PengembalianForm />;
}

export default Page;
