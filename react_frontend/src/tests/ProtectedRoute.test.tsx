// src/tests/ProtectedRoute.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import { AuthContextType } from '../types/auth.types';

// Mock du hook useAuth
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Import du hook mocké
import { useAuth } from '../hooks/useAuth';

describe('ProtectedRoute Component', () => {
  // Composant de test pour la route protégée
  const TestComponent = () => <div>Protected Content</div>;
  
  // Composant de test pour la redirection
  const LoginComponent = () => <div>Login Page</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when user is authenticated', () => {
    // Mock de l'état d'authentification (utilisateur connecté)
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, username: 'testuser', email: 'test@example.com', roles: ['ROLE_USER'] },
      loading: false
    } as AuthContextType);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<TestComponent />} />
          </Route>
          <Route path="/login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );

    // Vérifier que le contenu protégé est affiché
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    // Mock de l'état d'authentification (utilisateur non connecté)
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false
    } as AuthContextType);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<TestComponent />} />
          </Route>
          <Route path="/login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );

    // Vérifier que la redirection vers la page de connexion a été effectuée
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('shows loading indicator when authentication state is loading', () => {
    // Mock de l'état d'authentification (chargement en cours)
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true
    } as AuthContextType);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<TestComponent />} />
          </Route>
          <Route path="/login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );

    // Vérifier que l'indicateur de chargement est affiché
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('restricts access based on roles', () => {
    // Mock de l'état d'authentification (utilisateur connecté mais sans le rôle requis)
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, username: 'testuser', email: 'test@example.com', roles: ['ROLE_USER'] },
      loading: false
    } as AuthContextType);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin" element={<TestComponent />} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Vérifier que l'accès est refusé et qu'il y a redirection vers le tableau de bord
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  test('allows access when user has required role', () => {
    // Mock de l'état d'authentification (utilisateur connecté avec le rôle requis)
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, username: 'adminuser', email: 'admin@example.com', roles: ['ROLE_USER', 'ROLE_ADMIN'] },
      loading: false
    } as AuthContextType);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin" element={<TestComponent />} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Vérifier que le contenu protégé est affiché
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
