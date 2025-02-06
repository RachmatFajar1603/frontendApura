import React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import Riwayat from '@/components/riwayat/RiwayatPage';

export const metadata = {
  title: `Riwayat | ${config.site.name}`,
  description: 'Riwayat merupakan tampilan untuk melihat apa saja yang sudah pernah diaujukan oleh pengguna',
} satisfies Metadata;

function RiwayatPage() {
  return (
    <Riwayat/>
  );
}

export default RiwayatPage;
