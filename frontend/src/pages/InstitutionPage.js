import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';

const InstitutionPage = () => {
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '', logo: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitution();
  }, []);

  const fetchInstitution = async () => {
    try {
      const res = await api.get('/institution');
      setFormData(res.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/institution', formData);
      toast.success('Dados atualizados com sucesso!');
      fetchInstitution();
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  if (loading) return <div className="text-center py-12">Carregando...</div>;

  return (
    <div className="max-w-3xl space-y-6" data-testid="institution-page">
      <div className="flex items-center gap-3">
        <Building2 className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary">Instituição</h1>
          <p className="text-muted-foreground mt-1">Configure os dados da sua instituição</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Instituição</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Instituição *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <Button type="submit" className="w-full" data-testid="save-institution-button">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionPage;
