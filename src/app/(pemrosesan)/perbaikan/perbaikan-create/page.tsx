import React from 'react';


import { config } from '@/config';
import { type Metadata } from 'next';
import PerbaikanForm from '@/components/pemrosesan/perbaikan/perbaikan-create/PengajuanPerbaikan';

export const metadata = {
  title: `Pengajuan Perbaikan | Pemrosesan | ${config.site.name}`,
  description: 'Melakukan pengajuan perbaikan aset yang ada di FMIPA USK'
} satisfies Metadata;

function Page() {
  return <PerbaikanForm />;
}

export default Page;
