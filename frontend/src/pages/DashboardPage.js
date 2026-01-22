import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, UsersRound, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/dashboard/metrics');
      setMetrics(response.data);
    } catch (error) {
      toast.error('Erro ao carregar métricas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  const stats = [
    {
      name: 'Total de Alunos',
      value: metrics?.total_students || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      testId: 'total-students-metric'
    },
    {
      name: 'Alunos Ativos',
      value: metrics?.active_students || 0,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      testId: 'active-students-metric'
    },
    {
      name: 'Turmas Abertas',
      value: metrics?.total_turmas || 0,
      icon: UsersRound,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      testId: 'total-turmas-metric'
    },
    {
      name: 'Cursos Disponíveis',
      value: metrics?.total_courses || 0,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      testId: 'total-courses-metric'
    },
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div>
        <h1 className="text-4xl font-heading font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow duration-200" data-testid={stat.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-3xl font-bold text-primary mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {metrics?.students_by_course && metrics.students_by_course.length > 0 && (
        <Card data-testid="students-by-course-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Alunos por Curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.students_by_course}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {metrics?.recent_students && metrics.recent_students.length > 0 && (
        <Card data-testid="recent-students-list">
          <CardHeader>
            <CardTitle>Alunos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recent_students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  data-testid={`recent-student-${student.id}`}
                >
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-medium text-primary">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.turma_name} - {student.course_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    student.status === 'active' ? 'bg-green-100 text-green-700' :
                    student.status === 'inactive' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {student.status === 'active' ? 'Ativo' :
                     student.status === 'inactive' ? 'Inativo' : 'Formado'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;