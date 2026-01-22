import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', workload: '', description: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/');
      setCourses(res.data);
    } catch (error) {
      toast.error('Erro ao carregar cursos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/courses/${editing.id}`, formData);
        toast.success('Curso atualizado!');
      } else {
        await api.post('/courses', { ...formData, workload: parseInt(formData.workload) });
        toast.success('Curso criado!');
      }
      setDialogOpen(false);
      setFormData({ name: '', workload: '', description: '' });
      setEditing(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir curso?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Curso excluído!');
      fetchCourses();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div className="space-y-6" data-testid="courses-page">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-heading font-bold text-primary">Cursos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-course-button"><Plus className="h-4 w-4 mr-2" />Novo Curso</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} Curso</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Carga Horária (horas) *</Label>
                <Input type="number" value={formData.workload} onChange={(e) => setFormData({...formData, workload: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(c => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-heading font-semibold text-primary">{c.name}</h3>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(c); setFormData({name: c.name, workload: c.workload, description: c.description || ''}); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{c.workload}h de carga horária</p>
              {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
