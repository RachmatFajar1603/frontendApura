import React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import Profile from '@/components/lainnya/profile/profile';

export const metadata = {
  title: `Profile | Lainnya | ${config.site.name}`,
  description: 'Untuk mengelola data pengguna yang ada di FMIPA USK',
} satisfies Metadata;

function ProfilePage() {
  return (
      <Profile />
  );
}

export default ProfilePage;
