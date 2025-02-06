import React from 'react';

import { config } from '@/config';
import { type Metadata } from 'next';
import EditPenyewaanForm from '@/components/pemrosesan/penyewaan/penyewaan-edit/PengajuanPenyewaanEdit';


export const metadata = {
  title: `Pengajuan Penyewaan Edit| Pemrosesan | ${config.site.name}`,
  description: 'Melakukan pengajuan penyewaan aset yang ada di FMIPA USK'
} satisfies Metadata;

function Page() {
  return <EditPenyewaanForm />;
}

export default Page;
