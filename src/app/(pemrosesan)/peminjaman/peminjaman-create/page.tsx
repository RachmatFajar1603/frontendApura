import React from 'react';
import { type Metadata } from 'next';

import { config } from '@/config';
import PeminjamanForm from '@/components/pemrosesan/peminjaman/peminjaman-create/PengajuanPeminjaman';

export const metadata = {
  title: `Pengajuan Peminjaman | Pemrosesan | ${config.site.name}`,
  description: 'Melakukan pengajuan peminjaman aset yang ada di FMIPA USK',
} satisfies Metadata;

function Page() {
  return <PeminjamanForm />;
}

export default Page;
