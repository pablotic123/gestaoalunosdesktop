import React, { useEffect, useState, useRef } from 'react';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ImageIcon, Users, Download, FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

const PhotoGridPage = () => {
  const [students, setStudents] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingTurma, setExportingTurma] = useState(null);

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
    const turmaId = student.turma_id;
    const turmaName = student.turma_name;
    if (!acc[turmaId]) {
      acc[turmaId] = { name: turmaName, students: [] };
    }
    acc[turmaId].students.push(student);
    return acc;
  }, {});

  // Função para converter imagem base64/URL para dados de imagem
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Função para gerar PDF de uma turma
  const exportTurmaToPDF = async (turmaId, turmaData) => {
    setExportingTurma(turmaId);
    setExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const photoSize = 35;
      const photoGap = 8;
      const textHeight = 12;
      const itemHeight = photoSize + textHeight + 5;
      const cols = Math.floor((pageWidth - 2 * margin) / (photoSize + photoGap));
      
      let currentX = margin;
      let currentY = margin + 20;
      let col = 0;

      // Título
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(turmaData.name, pageWidth / 2, margin + 5, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total de alunos: ${turmaData.students.length}`, pageWidth / 2, margin + 12, { align: 'center' });

      // Data de geração
      const dataGeracao = new Date().toLocaleDateString('pt-BR');
      pdf.setFontSize(8);
      pdf.text(`Gerado em: ${dataGeracao}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

      // Processar cada aluno
      for (let i = 0; i < turmaData.students.length; i++) {
        const student = turmaData.students[i];
        
        // Verificar se precisa de nova página
        if (currentY + itemHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin + 10;
          col = 0;
          currentX = margin;
        }

        // Desenhar quadro para foto
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(currentX, currentY, photoSize, photoSize, 3, 3, 'FD');

        // Tentar adicionar foto
        if (student.photo) {
          try {
            // Se for base64, usar diretamente
            if (student.photo.startsWith('data:image')) {
              pdf.addImage(student.photo, 'JPEG', currentX + 2, currentY + 2, photoSize - 4, photoSize - 4);
            }
          } catch (e) {
            // Se falhar, mostrar inicial
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(100, 100, 100);
            pdf.text(student.name.charAt(0).toUpperCase(), currentX + photoSize / 2, currentY + photoSize / 2 + 5, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
          }
        } else {
          // Mostrar inicial se não tem foto
          pdf.setFontSize(24);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(100, 100, 100);
          pdf.text(student.name.charAt(0).toUpperCase(), currentX + photoSize / 2, currentY + photoSize / 2 + 5, { align: 'center' });
          pdf.setTextColor(0, 0, 0);
        }

        // Nome do aluno
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        const truncatedName = student.name.length > 18 ? student.name.substring(0, 16) + '...' : student.name;
        pdf.text(truncatedName, currentX + photoSize / 2, currentY + photoSize + 6, { align: 'center', maxWidth: photoSize });

        // Próxima posição
        col++;
        if (col >= cols) {
          col = 0;
          currentX = margin;
          currentY += itemHeight;
        } else {
          currentX += photoSize + photoGap;
        }
      }

      // Salvar PDF com nome da turma
      const fileName = `${turmaData.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
      toast.success(`PDF "${fileName}" gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setExporting(false);
      setExportingTurma(null);
    }
  };

  // Função para exportar todas as turmas
  const exportAllToPDF = async () => {
    setExporting(true);
    
    try {
      for (const [turmaId, turmaData] of Object.entries(groupedByTurma)) {
        setExportingTurma(turmaId);
        await exportTurmaToPDF(turmaId, turmaData);
        // Pequena pausa entre downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success('Todos os PDFs foram gerados!');
    } catch (error) {
      toast.error('Erro ao gerar PDFs');
    } finally {
      setExporting(false);
      setExportingTurma(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6" data-testid="photo-grid-page">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary">Grade de Fotos</h1>
          <p className="text-muted-foreground mt-2">Visualização dos alunos por turma</p>
        </div>
        
        {/* Botão de exportar todos */}
        {Object.keys(groupedByTurma).length > 0 && (
          <Button
            onClick={exportAllToPDF}
            disabled={exporting}
            variant="outline"
            className="gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando PDFs...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Exportar Todas as Turmas
              </>
            )}
          </Button>
        )}
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
        Object.entries(groupedByTurma).map(([turmaId, turmaData]) => (
          <div key={turmaId} className="space-y-4" data-testid={`turma-group-${turmaData.name}`}>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-primary">{turmaData.name}</h2>
                  <p className="text-sm text-muted-foreground">{turmaData.students.length} alunos</p>
                </div>
              </div>
              
              {/* Botão de exportar turma individual */}
              <Button
                onClick={() => exportTurmaToPDF(turmaId, turmaData)}
                disabled={exporting}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {exportingTurma === turmaId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {turmaData.students.map((student) => (
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
