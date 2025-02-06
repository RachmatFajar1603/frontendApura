'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Divider } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Buildings } from '@phosphor-icons/react/dist/ssr/Buildings';

import type { NavItemConfig } from '@/types/nav';
import { useDepartemen } from '@/lib/departemen/departemen';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useUsers } from '@/hooks/use-user';

import { navItems } from './config';
import { navIcons } from './nav-icons';
import dynamic from 'next/dynamic';
// import Footer from '@/components/core/footer';
const Footer = dynamic(() => import('@/components/core/footer'), {
  ssr: false,
  loading: () => null
});

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const { departemen } = useDepartemen();
  const { user } = useUsers();

  const filteredNavItems = navItems.filter((item) => user?.role && item.roles?.includes(user.role));

  const getDepartemenName = (departemenId: string) => {
    const foundDepartemen = departemen.find((d) => d.id === departemenId);
    return foundDepartemen ? foundDepartemen.nama : 'Unknown';
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

  return (
    <Box
      sx={{
        '--SideNav-background': 'var(--mui-palette-neutral-950)',
        '--SideNav-color': 'var(--mui-palette-common-white)',
        '--NavItem-color': 'var(--mui-palette-neutral-300)',
        '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
        '--NavItem-active-background': 'var(--mui-palette-primary-main)',
        '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
        '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
        '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
        bgcolor: 'var(--SideNav-background)',
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        maxWidth: '100%',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* <Box
          component={RouterLink}
          href={paths.home}
          sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}
        >
          <Logo color="light" height={50} width={122} />
        </Box> */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              height: 40,
              width: 40,
              backgroundColor: '#FFCC28',
              color: '#000',
            }}
          >
            {getInitials(user?.namaLengkap || '')}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#fff',
              }}
            >
              {user?.namaLengkap} - {user?.noIdentitas}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'neutral.200',
              }}
            >
              <Buildings size={12} />
              {getDepartemenName(user?.departemenId || '')}
            </Typography>
          </Box>
        </Box>
      </Stack>
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: filteredNavItems })}
      </Box>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-300)', width: '80%', margin: '0 auto' }} />
      <Footer />
    </Box>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, items: subItems, ...item } = curr;
    acc.push(
      <NavItem key={key} pathname={pathname} {...item}>
        {subItems && subItems.length > 0 ? <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0, pl: 2 }}>
            {subItems.map((subItem) => {
              const { key: subKey, ...subItemProps } = subItem;
              return <NavItem key={subKey} pathname={pathname} {...subItemProps} />;
            })}
          </Stack> : null}
      </NavItem>
    );
    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
  children?: React.ReactNode;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  children,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          ...(disabled && {
            bgcolor: '#FFCC28',
            color: '#fff',
            cursor: 'not-allowed',
          }),
          ...(active && { bgcolor: '#FFCC28', color: '#000' }),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={active ? '#000' : '#fff'}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
      {children}
    </li>
  );
}
