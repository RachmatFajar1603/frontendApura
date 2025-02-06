export interface User {
  id: string;
  namaLengkap: string;
  noIdentitas: string;
  email: string;
  phoneNumber: string;
  role?: string;
  departemenId?: string;
  isVerified?: boolean;

  [key: string]: unknown;
}
