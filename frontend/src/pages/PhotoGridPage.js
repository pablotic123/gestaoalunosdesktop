import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ImageIcon, Users } from 'lucide-react';

const PhotoGridPage = () => {
  const [students, setStudents] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, selectedTurma]);

  const fetchData = async () => {
    try {
      const [studentsRes, turmasRes] = await Promise.all([
        api.get('/students'),
        api.get('/turmas')
      ]);
      setStudents(studentsRes.data);
      setTurmas(turmasRes.data);
      setFilteredStudents(studentsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (selectedTurma === 'all') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(s => s.turma_id === selectedTurma));
    }
  };

  const groupedByTurma = filteredStudents.reduce((acc, student) => {
    const turmaName = student.turma_name;
    if (!acc[turmaName]) {
      acc[turmaName] = [];
    }
    acc[turmaName].push(student);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6" data-testid="photo-grid-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary">Grade de Fotos</h1>
          <p className="text-muted-foreground mt-2">Visualização dos alunos por turma</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="max-w-xs">
            <Label>Filtrar por Turma</Label>
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger data-testid="turma-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Turmas</SelectItem>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.name} - {turma.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {Object.keys(groupedByTurma).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum aluno encontrado</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByTurma).map(([turmaName, students]) => (
          <div key={turmaName} className="space-y-4" data-testid={`turma-group-${turmaName}`}>
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-2xl font-heading font-semibold text-primary">{turmaName}</h2>
                <p className="text-sm text-muted-foreground">{students.length} alunos</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {students.map((student) => (
                <Card
                  key={student.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  data-testid={`student-card-${student.id}`}
                >
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                              <span className="text-3xl font-bold text-primary">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-medium text-white text-sm line-clamp-2 drop-shadow-lg">
                          {student.name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PhotoGridPage;
