import React from 'react';
import { type Metadata } from 'next';

import { config } from '@/config';
import EditPengembalianForm from '@/components/pemrosesan/pengembalian/pengembalian-edit/PengajuanPengembalianEdit';

export const metadata = {
  title: `Pengajuan Pengembalian Edit| Pemrosesan | ${config.site.name}`,
  description: 'Melakukan pengajuan peminjaman aset yang ada di FMIPA USK',
} satisfies Metadata;

function Page() {
  return <EditPengembalianForm />;
}

export default Page;
