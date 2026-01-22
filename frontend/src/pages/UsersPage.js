import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Shield, User } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'professor' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      toast.success('Usuário criado!');
      setDialogOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'professor' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Usuário excluído!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao excluir');
    }
  };

  return (
    <div className="space-y-6" data-testid="users-page">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-heading font-bold text-primary">Usuários</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-user-button"><Plus className="h-4 w-4 mr-2" />Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Usuário</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Senha *</Label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Perfil *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Criar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <Card key={u.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {u.role === 'admin' ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{u.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{u.role === 'admin' ? 'Administrador' : 'Professor'}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(u.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{u.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
