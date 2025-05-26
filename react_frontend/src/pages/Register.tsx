// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthService from '../services/auth.service';
import { SignupRequest } from '../types/auth.types';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setLoading, setError, loading, error } = useAuth();
  
  const [formData, setFormData] = useState<SignupRequest>({
    username: '',
    email: '',
    password: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requestAdmin, setRequestAdmin] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { 
      username: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
      isValid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }
    
    // Confirm password validation
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
      // Clear field error when user starts typing
      if (formErrors.confirmPassword) {
        setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear field error when user starts typing
      if (formErrors[name as keyof typeof formErrors]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
    
    // Clear global error when user makes changes
    if (error) {
      setError(null);
    }
  };

  const handleAdminCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestAdmin(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Add role if admin is requested
      const userData: SignupRequest = { ...formData };
      if (requestAdmin) {
        userData.role = ['admin'];
      }
      
      await AuthService.register(userData);
      setSuccess(true);
      
      // Reset form after successful registration
      setFormData({
        username: '',
        email: '',
        password: '',
      });
      setConfirmPassword('');
      setRequestAdmin(false);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      // Handle specific error cases
      if (err.response) {
        switch (err.response.status) {
          case 400:
            if (err.response.data?.message?.includes('Username')) {
              setError('Ce nom d\'utilisateur est déjà pris.');
            } else if (err.response.data?.message?.includes('Email')) {
              setError('Cet email est déjà utilisé.');
            } else {
              setError(`Erreur d'inscription: ${err.response.data?.message || 'Veuillez vérifier vos informations.'}`);
            }
            break;
          default:
            setError(`Erreur d'inscription: ${err.response.data?.message || 'Veuillez réessayer plus tard.'}`);
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
          Inscription
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            Inscription réussie ! Vous allez être redirigé vers la page de connexion...
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
            disabled={loading || success}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adresse email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={loading || success}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={loading || success}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            disabled={loading || success}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={requestAdmin}
                onChange={handleAdminCheckbox}
                name="requestAdmin"
                color="primary"
                disabled={loading || success}
              />
            }
            label="Demander les droits administrateur"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || success}
          >
            {loading ? <CircularProgress size={24} /> : 'S\'inscrire'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Déjà inscrit ?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Se connecter
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
