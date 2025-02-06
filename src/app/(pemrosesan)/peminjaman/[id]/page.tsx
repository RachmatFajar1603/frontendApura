import React from 'react';

import { config } from '@/config';
import { type Metadata } from 'next';
import EditPeminjamanForm from '@/components/pemrosesan/peminjaman/peminjaman-edit/PengajuanPeminjamanEdit';

export const metadata = {
  title: `Pengajuan Peminjaman Edit| Pemrosesan | ${config.site.name}`,
  description: 'Melakukan pengajuan peminjaman aset yang ada di FMIPA USK'
} satisfies Metadata;

function Page() {
  return <EditPeminjamanForm />;
}

export default Page;
