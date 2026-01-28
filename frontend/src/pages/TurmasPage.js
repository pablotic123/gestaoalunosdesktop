import React, { useEffect, useState, useMemo } from 'react';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Pagination from '@/components/Pagination';

const TurmasPage = () => {
  const [turmas, setTurmas] = useState([]);
  const [courses, setCourses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', course_id: '', period: '', year: new Date().getFullYear() });
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [turmasRes, coursesRes] = await Promise.all([api.get('/turmas'), api.get('/courses')]);
      setTurmas(turmasRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
  };

  // Dados paginados
  const paginatedTurmas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return turmas.slice(startIndex, startIndex + itemsPerPage);
  }, [turmas, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(turmas.length / itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/turmas/${editing.id}`, formData);
        toast.success('Turma atualizada!');
      } else {
        await api.post('/turmas', formData);
        toast.success('Turma criada!');
      }
      setDialogOpen(false);
      setFormData({ name: '', course_id: '', period: '', year: new Date().getFullYear() });
      setEditing(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir turma?')) return;
    try {
      await api.delete(`/turmas/${id}`);
      toast.success('Turma excluída!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6" data-testid="turmas-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary">Turmas</h1>
          <p className="text-muted-foreground mt-2">Gerencie as turmas da instituição</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-turma-button"><Plus className="h-4 w-4 mr-2" />Nova Turma</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} Turma</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required data-testid="turma-name-input" />
              </div>
              <div className="space-y-2">
                <Label>Curso *</Label>
                <Select value={formData.course_id} onValueChange={(v) => setFormData({...formData, course_id: v})} required>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Período *</Label>
                  <Input value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Ano *</Label>
                  <Input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} required />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Curso</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Período</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Ano</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTurmas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    Nenhuma turma encontrada
                  </td>
                </tr>
              ) : (
                paginatedTurmas.map(t => (
                  <tr key={t.id} className="hover:bg-accent">
                    <td className="px-6 py-4 font-medium">{t.name}</td>
                    <td className="px-6 py-4">{t.course_name}</td>
                    <td className="px-6 py-4">{t.period}</td>
                    <td className="px-6 py-4">{t.year}</td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(t); setFormData({name: t.name, course_id: t.course_id, period: t.period, year: t.year}); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginação */}
          {turmas.length > 0 && (
            <div className="border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={turmas.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TurmasPage;
