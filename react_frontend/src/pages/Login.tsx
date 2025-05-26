// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthService from '../services/auth.service';
import { LoginRequest } from '../types/auth.types';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Alert 
} from '@mui/material';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, setLoading, setError, loading, error } = useAuth();
  
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: ''
  });

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { username: '', password: '' };
    
    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear global error when user makes changes
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await AuthService.login(formData);
      
      // Use the login function from AuthContext to update global state
      login(response.token, {
        id: response.id,
        username: response.username,
        email: response.email,
        roles: response.roles
      });
      
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (err: any) {
      // Handle specific error cases
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Identifiants invalides. Veuillez réessayer.');
            break;
          case 403:
            setError('Accès refusé. Veuillez contacter l\'administrateur.');
            break;
          default:
            setError(`Erreur de connexion: ${err.response.data?.message || 'Veuillez réessayer plus tard.'}`);
        }
      } else {
        setError('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          marginTop: 8, 
          padding: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Typography component="h1" variant="h5">
          Connexion
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nom d'utilisateur"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            error={!!formErrors.username}
            helperText={formErrors.username}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Se connecter'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Pas encore de compte?{' '}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
