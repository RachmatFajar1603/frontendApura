import React from 'react';
import { AxiosError } from 'axios';

import api from '../api';

interface Shift {
  id: string;
  namaShift: string;
  jamMulai: string;
  jamSelesai: string;
}

interface ShiftResponse {
  content: {
    entries: Shift[];
  };
}

export const useShift = () => {
  const [shift, setShift] = React.useState<Shift[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const getShift = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get<ShiftResponse>(`${process.env.NEXT_PUBLIC_API_URL}/shift`);
      const data = response.data;
      setShift(data.content.entries);
    } catch (err) {
      // Rename the error variable to avoid shadowing
      if (err instanceof AxiosError) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getShift();
  }, []);

  return { shift, loading, error, getShift };
};
