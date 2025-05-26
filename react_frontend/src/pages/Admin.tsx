// src/pages/Admin.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { Delete, Edit, Add, Check, Block } from '@mui/icons-material';

// Types pour les utilisateurs dans le panneau d'administration
interface AdminUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  active: boolean;
}

// Simuler un service qui récupérerait les données utilisateurs pour l'admin
// Dans une application réelle, cela serait remplacé par un appel API
const fetchUsers = async (): Promise<AdminUser[]> => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      roles: ['ROLE_ADMIN', 'ROLE_USER'],
      createdAt: '2023-01-01',
      active: true
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      roles: ['ROLE_USER'],
      createdAt: '2023-01-15',
      active: true
    },
    {
      id: 3,
      username: 'user2',
      email: 'user2@example.com',
      roles: ['ROLE_USER'],
      createdAt: '2023-02-20',
      active: false
    },
    {
      id: 4,
      username: 'moderator',
      email: 'mod@example.com',
      roles: ['ROLE_USER'],
      createdAt: '2023-03-10',
      active: true
    }
  ];
};

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // État pour le dialogue de modification/ajout d'utilisateur
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    isAdmin: false
  });
  
  // État pour le dialogue de confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  
  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Impossible de charger la liste des utilisateurs. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Vérifier si l'utilisateur actuel est admin
  const isAdmin = user?.roles.includes('ROLE_ADMIN');

  if (!isAdmin) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" color="error">
            Accès refusé
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Vous n'avez pas les droits administrateur nécessaires pour accéder à cette page.
          </Typography>
          <Button variant="contained" href="/dashboard" sx={{ mt: 2 }}>
            Retour au tableau de bord
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
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

  // Gestionnaires d'événements pour le dialogue d'édition/ajout
  const handleOpenDialog = (mode: 'add' | 'edit', user?: AdminUser) => {
    setDialogMode(mode);
    if (mode === 'edit' && user) {
      setCurrentUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        isAdmin: user.roles.includes('ROLE_ADMIN')
      });
    } else {
      setCurrentUser(null);
      setFormData({
        username: '',
        email: '',
        isAdmin: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    if (name === 'isAdmin') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitForm = () => {
    // Simuler l'ajout/modification d'un utilisateur
    if (dialogMode === 'add') {
      const newUser: AdminUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        username: formData.username,
        email: formData.email,
        roles: formData.isAdmin ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'],
        createdAt: new Date().toISOString().split('T')[0],
        active: true
      };
      setUsers([...users, newUser]);
      setSnackbar({
        open: true,
        message: 'Utilisateur ajouté avec succès',
        severity: 'success'
      });
    } else if (currentUser) {
      const updatedUsers = users.map(u => 
        u.id === currentUser.id 
          ? { 
              ...u, 
              username: formData.username, 
              email: formData.email, 
              roles: formData.isAdmin ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'] 
            } 
          : u
      );
      setUsers(updatedUsers);
      setSnackbar({
        open: true,
        message: 'Utilisateur modifié avec succès',
        severity: 'success'
      });
    }
    handleCloseDialog();
  };

  // Gestionnaires d'événements pour le dialogue de suppression
  const handleOpenDeleteDialog = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      const updatedUsers = users.filter(u => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      setSnackbar({
        open: true,
        message: 'Utilisateur supprimé avec succès',
        severity: 'success'
      });
    }
    handleCloseDeleteDialog();
  };

  // Gestionnaire pour activer/désactiver un utilisateur
  const handleToggleUserStatus = (user: AdminUser) => {
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, active: !u.active } : u
    );
    setUsers(updatedUsers);
    setSnackbar({
      open: true,
      message: `Utilisateur ${user.active ? 'désactivé' : 'activé'} avec succès`,
      severity: 'success'
    });
  };

  // Gestionnaire pour fermer la notification
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography component="h1" variant="h5">
            Panneau d'administration
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog('add')}
          >
            Ajouter un utilisateur
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom d'utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôles</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.roles.map((role, index) => (
                      <Chip 
                        key={index}
                        label={role.replace('ROLE_', '')}
                        color={role.includes('ADMIN') ? 'primary' : 'default'}
                        size="small"
                        sx={{ mr: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.active ? 'Actif' : 'Inactif'}
                      color={user.active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDialog('edit', user)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color={user.active ? 'error' : 'success'} 
                      onClick={() => handleToggleUserStatus(user)}
                      size="small"
                    >
                      {user.active ? <Block /> : <Check />}
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleOpenDeleteDialog(user)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogue d'édition/ajout d'utilisateur */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogMode === 'add' ? 'Ajouter un utilisateur' : 'Modifier un utilisateur'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Nom d'utilisateur"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleFormChange}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" component="div" gutterBottom>
              Rôles:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip label="ROLE_USER" size="small" sx={{ mr: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  label="ROLE_ADMIN" 
                  color={formData.isAdmin ? 'primary' : 'default'} 
                  size="small" 
                />
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleFormChange}
                  style={{ marginLeft: '8px' }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmitForm} variant="contained">
            {dialogMode === 'add' ? 'Ajouter' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'utilisateur "{userToDelete?.username}" ? 
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Admin;
