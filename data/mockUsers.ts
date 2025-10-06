import { User, Role } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Mario Rossi',
    role: Role.ADMIN,
  },
  {
    id: 'user-2',
    name: 'Anna Verdi',
    role: Role.MANAGER,
  },
  {
    id: 'user-3',
    name: 'Luca Bianchi',
    role: Role.AFFILIATE,
    sourceId: 'lucab',
  },
    {
    id: 'user-4',
    name: 'Giulia Neri',
    role: Role.AFFILIATE,
    sourceId: 'giulian',
  },
];
