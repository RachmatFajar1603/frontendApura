import React from 'react';

import { config } from '@/config';
import { type Metadata } from 'next';
import EditPerbaikanForm from '@/components/pemrosesan/perbaikan/perbaikan-edit/PengajuanPerbaikanEdit';

export const metadata = {
  title: `Pengajuan Perbaikan Edit| Pemrosesan | ${config.site.name}`,
  description: 'Melakukan pengajuan perbaikan aset yang ada di FMIPA USK'
} satisfies Metadata;

function Page() {
  return <EditPerbaikanForm />;
}

export default Page;
