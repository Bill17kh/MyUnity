// src/tests/Register.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
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

describe('Register Component', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  test('renders register form correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Vérifier que les éléments du formulaire sont présents
    expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/demander les droits administrateur/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
    expect(screen.getByText(/déjà inscrit/i)).toBeInTheDocument();
    expect(screen.getByText(/se connecter/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Soumettre le formulaire sans remplir les champs
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Vérifier que les messages d'erreur sont affichés
    await waitFor(() => {
      expect(screen.getByText(/le nom d'utilisateur est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Remplir le formulaire avec un email invalide
    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/adresse email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'password123' } });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Vérifier que le message d'erreur pour l'email est affiché
    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
    });
  });

  test('validates password confirmation', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Remplir le formulaire avec des mots de passe différents
    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/adresse email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'differentpassword' } });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Vérifier que le message d'erreur pour la confirmation du mot de passe est affiché
    await waitFor(() => {
      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    // Mock de la réponse du service d'authentification
    const mockResponse = {
      message: 'User registered successfully!'
    };
    
    (AuthService.register as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Remplir le formulaire avec des données valides
    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/adresse email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'password123' } });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Vérifier que le service d'authentification a été appelé avec les bonnes données
    await waitFor(() => {
      expect(AuthService.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    // Vérifier que le message de succès est affiché
    await waitFor(() => {
      expect(screen.getByText(/inscription réussie/i)).toBeInTheDocument();
    });

    // Vérifier que la redirection sera effectuée (après un délai)
    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('handles registration with admin role', async () => {
    // Mock de la réponse du service d'authentification
    const mockResponse = {
      message: 'User registered successfully!'
    };
    
    (AuthService.register as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Remplir le formulaire avec des données valides et demander les droits admin
    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), { target: { value: 'adminuser' } });
    fireEvent.change(screen.getByLabelText(/adresse email/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByLabelText(/demander les droits administrateur/i));

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Vérifier que le service d'authentification a été appelé avec les bonnes données, incluant le rôle admin
    await waitFor(() => {
      expect(AuthService.register).toHaveBeenCalledWith({
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'password123',
        role: ['admin']
      });
    });
  });

  test('handles registration error', async () => {
    // Mock d'une erreur du service d'authentification
    const mockError = {
      response: {
        status: 400,
        data: { message: 'Username is already taken!' }
      }
    };
    
    (AuthService.register as jest.Mock).mockRejectedValue(mockError);

    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Remplir le formulaire avec des données
    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByLabelText(/adresse email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'password123' } });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Vérifier que le message d'erreur est affiché
    await waitFor(() => {
      expect(screen.getByText(/ce nom d'utilisateur est déjà pris/i)).toBeInTheDocument();
    });
  });
});
