import React from 'react';
import { Box, Card, CardContent, Divider, Grid, Typography } from '@mui/material';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { UsersFour } from '@phosphor-icons/react/dist/ssr/UsersFour';

interface HistoryCardListProps {
  filteredHistoryItems: any[];
  renderStatusChip: (status: string, type: 'statusAset' | 'statusPengajuan') => JSX.Element;
}

const HistoryCardList: React.FC<HistoryCardListProps> = ({ filteredHistoryItems, renderStatusChip }) => {
  return (
    <Grid container spacing={3} sx={{ mt: 6 }}>
      {filteredHistoryItems.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card
            variant="elevation"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 3,
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  color={
                    item.type === 'Peminjaman'
                      ? 'primary'
                      : item.type === 'Penyewaan'
                        ? '#059212'
                        : item.type === 'Perbaikan'
                          ? '#211951'
                          : 'text.secondary'
                  }
                  sx={{ fontWeight: 'bold' }}
                >
                  {item.type}
                </Typography>
                {renderStatusChip(item.statusPengajuan, 'statusPengajuan')}
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {item.type === 'Peminjaman'
                  ? item.namaPeminjam?.namaLengkap
                  : item.type === 'Penyewaan'
                    ? item.namaPenyewa?.namaLengkap
                    : item.namaPengaju?.namaLengkap}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box component="span" sx={{ mr: 1, fontSize: 18, display: 'flex', alignItems: 'center' }}>
                    <CalendarBlank />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.tanggalMulai} - {item.tanggalSelesai}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box component="span" sx={{ mr: 1, fontSize: 18, display: 'flex', alignItems: 'center' }}>
                    <UsersFour />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Departemen: {item.departemenName || '-'}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Tujuan: {item.tujuan}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mt: 1 }}>
                  Aset: {item.asetName}
                </Typography>

                {item.type === 'Penyewaan' && item.totalBiaya ? (
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Total Biaya: Rp {item.totalBiaya.toLocaleString()}
                  </Typography>
                ) : null}

                <Typography variant="body2" color="text.secondary">
                  {item.type === 'Perbaikan' ? `Deskripsi: ${item.deskripsi}` : `Tujuan: ${item.tujuan}`}
                </Typography>

                {item.type === 'Perbaikan' && (
                  <Typography
                    variant="body2"
                    color={item.kondisiAset?.toLowerCase() === 'rusak' ? 'error' : 'text.secondary'}
                  >
                    Kondisi Aset: {item.kondisiAset}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 2,
                }}
              >
                {renderStatusChip(item.statusAset, 'statusAset')}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default HistoryCardList;
