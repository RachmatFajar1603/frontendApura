import React from 'react';


import { config } from '@/config';
import { type Metadata } from 'next';
import PenyewaanForm from '@/components/pemrosesan/penyewaan/penyewaan-create/PengajuanPenyewaan';

export const metadata = {
  title: `Pengajuan Penyewaan | Pemrosesan | ${config.site.name}`,
  description: 'Melakukan pengajuan penyewaan aset yang ada di FMIPA USK'
} satisfies Metadata;

function Page() {
  return <PenyewaanForm />;
}

export default Page;
