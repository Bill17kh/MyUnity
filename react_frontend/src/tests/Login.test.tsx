// src/tests/Login.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';
import AuthService from '../services/auth.service';

// Mock du service d'authentification
jest.mock('../services/auth.service');

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Vérifier que les éléments du formulaire sont présents
    expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    expect(screen.getByText(/pas encore de compte/i)).toBeInTheDocument();
    expect(screen.getByText(/s'inscrire/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Soumettre le formulaire sans remplir les champs
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    // Vérifier que les messages d'erreur sont affichés
    await waitFor(() => {
      expect(screen.getByText(/le nom d'utilisateur est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument();
    });
  });

  test('shows error for short password', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Remplir le formulaire avec un mot de passe trop court
    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: '12345' } });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    // Vérifier que le message d'erreur pour le mot de passe est affiché
    await waitFor(() => {
      expect(screen.getByText(/le mot de passe doit contenir au moins 6 caractères/i)).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    // Mock de la réponse du service d'authentification
    const mockResponse = {
      token: 'fake-jwt-token',
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER']
    };
    
    (AuthService.login as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Remplir le formulaire avec des données valides
    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    // Vérifier que le service d'authentification a été appelé avec les bonnes données
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });

    // Vérifier que la redirection a été effectuée
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles login error', async () => {
    // Mock d'une erreur du service d'authentification
    const mockError = {
      response: {
        status: 401,
        data: { message: 'Invalid credentials' }
      }
    };
    
    (AuthService.login as jest.Mock).mockRejectedValue(mockError);

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Remplir le formulaire avec des données
    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'wrongpassword' } });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    // Vérifier que le message d'erreur est affiché
    await waitFor(() => {
      expect(screen.getByText(/identifiants invalides/i)).toBeInTheDocument();
    });

    // Vérifier que la redirection n'a pas été effectuée
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
