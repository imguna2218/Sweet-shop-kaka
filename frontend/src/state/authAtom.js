// src/state/authAtom.js
import { atom } from 'jotai'; // CHANGE THIS

export const authState = atom({ // NO KEY NEEDED
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAdmin: JSON.parse(localStorage.getItem('user') || '{}')?.isAdmin || false,
});