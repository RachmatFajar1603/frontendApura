import React from 'react';
import { AxiosError } from 'axios';

import api from '../api';

interface User {
  isVerified?: any;
  id: string;
  namaLengkap: string;
  email: string;
  noIdentitas: string;
  phoneNumber: string;
  role: string;
  departemenId?: string;
  departemen?: any;
}

export const useUser = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);

  const getUser = React.useCallback(
    async (page = currentPage, rows = totalData) => {
      setLoading(true);
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/users?page=${page}&rows=${rows}`);
        const data = response.data;
        setUsers(data.content.entries);
        setTotalData(data.content.totalData);
        setCurrentPage(page);
        setRowsPerPage(rows);
      } catch (error) {
        setError(error instanceof AxiosError ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, rowsPerPage, totalData]
  );

  const getUserById = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
      return {
        status: response.status,
        message: response.data.message,
        data: response.data.content,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const postUser = async (user: Omit<User, 'id'>) => {
    setLoading(true);
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, user);
      const newUser = response.data.content.user;
      setUsers((prevUsers) => [...prevUsers, newUser]);
      setTotalData((prevTotal) => prevTotal + 1);
      return {
        status: response.status,
        message: response.data.message,
        data: newUser,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    setLoading(true);
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, updatedUser);
      await getUser(currentPage, rowsPerPage); // Fetch data ulang setelah post berhasil
      return {
        status: response.status,
        message: response.data.message,
        data: response.data.content,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/users?ids=${encodeURIComponent(JSON.stringify(ids))}`
      );
      await getUser(currentPage, rowsPerPage);
      return {
        status: response.status,
        message: response.data.message,
        data: response.data.content,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
      }
      throw new Error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getUser();
  }, [getUser]);

  return {
    users,
    loading,
    error,
    getUser,
    postUser,
    totalData,
    currentPage,
    rowsPerPage,
    setCurrentPage,
    setRowsPerPage,
    getUserById,
    updateUser,
    deleteUser,
  };
};
