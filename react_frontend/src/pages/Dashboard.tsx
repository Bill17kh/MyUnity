// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  Button, 
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Person, Email, Security, Dashboard as DashboardIcon } from '@mui/icons-material';

// Simuler un service qui récupérerait les données utilisateur
// Dans une application réelle, cela serait remplacé par un appel API
const fetchUserData = async (userId: number) => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: userId,
    username: 'utilisateur_actuel',
    email: 'utilisateur@example.com',
    joinDate: '2023-01-15',
    lastLogin: new Date().toISOString(),
    stats: {
      postsCount: 12,
      communitiesJoined: 5,
      activeDays: 45
    }
  };
};

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await fetchUserData(user.id);
        setUserData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Impossible de charger les données utilisateur. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" color="error">
            Session expirée ou utilisateur non connecté
          </Typography>
          <Button variant="contained" href="/login" sx={{ mt: 2 }}>
            Se connecter
          </Button>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" color="error">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()} 
            sx={{ mt: 2 }}
          >
            Réessayer
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profil utilisateur */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" component="h2">
                {user.username}
              </Typography>
              <Typography color="textSecondary">
                {user.email}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {user.roles.map((role, index) => (
                  <Typography 
                    key={index} 
                    variant="body2" 
                    color="primary" 
                    sx={{ 
                      display: 'inline-block', 
                      bgcolor: 'primary.light', 
                      color: 'white',
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      mr: 0.5
                    }}
                  >
                    {role.replace('ROLE_', '')}
                  </Typography>
                ))}
              </Box>
            </Box>
            <Button variant="outlined" fullWidth>
              Modifier le profil
            </Button>
          </Paper>
        </Grid>
        
        {/* Statistiques */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Statistiques
            </Typography>
            <Grid container spacing={3} sx={{ flex: 1 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" component="div">
                    {userData?.stats?.postsCount || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Publications
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" component="div">
                    {userData?.stats?.communitiesJoined || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Communautés
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" component="div">
                    {userData?.stats?.activeDays || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Jours actifs
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Dernière connexion: {new Date().toLocaleDateString()}
              </Typography>
              <Button size="small" color="primary">
                Voir plus
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Informations du compte */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Informations du compte
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText 
                  primary="Nom d'utilisateur" 
                  secondary={user.username} 
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={user.email} 
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemIcon>
                  <Security />
                </ListItemIcon>
                <ListItemText 
                  primary="Rôles" 
                  secondary={user.roles.join(', ')} 
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="ID Utilisateur" 
                  secondary={user.id} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
