import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Edit, Trash2, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  max_daily_classes: number;
  constraints: any;
  created_at: string;
}

interface TeachersListProps {
  refreshKey?: number;
  onAddTeacher: () => void;
}

const TeachersList = ({ refreshKey, onAddTeacher }: TeachersListProps) => {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, [refreshKey]);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: "Erro ao carregar professores",
        description: "Não foi possível carregar a lista de professores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeacher = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o professor ${name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Professor excluído",
        description: `${name} foi removido do sistema.`,
      });

      loadTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Erro ao excluir professor",
        description: "Não foi possível excluir o professor.",
        variant: "destructive",
      });
    }
  };

  const getSubjects = (teacher: Teacher) => {
    if (teacher.constraints?.subjects && Array.isArray(teacher.constraints.subjects)) {
      return teacher.constraints.subjects;
    }
    return [teacher.subject].filter(Boolean);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando professores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Professores
          </h2>
          <p className="text-muted-foreground">Gerencie o corpo docente da escola</p>
        </div>
        <Button 
          onClick={onAddTeacher}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          <Users className="mr-2 h-4 w-4" />
          Adicionar Professor
        </Button>
      </div>

      {/* Teachers List */}
      {teachers.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum professor cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Adicione professores para começar a gerar horários inteligentes.
            </p>
            <Button onClick={onAddTeacher} variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Adicionar Primeiro Professor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-primary" />
                      {teacher.name}
                    </CardTitle>
                    <CardDescription>
                      Cadastrado em {new Date(teacher.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteTeacher(teacher.id, teacher.name)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Subjects */}
                <div>
                  <p className="text-sm font-medium mb-2">Matérias:</p>
                  <div className="flex flex-wrap gap-1">
                    {getSubjects(teacher).map((subject: string) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Max Classes */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Máx. {teacher.max_daily_classes} aulas/dia
                  </span>
                </div>

                {/* Constraints */}
                {teacher.constraints?.preferences && (
                  <div>
                    <p className="text-sm font-medium mb-1">Preferências:</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {teacher.constraints.preferences}
                    </p>
                  </div>
                )}

                {/* Unavailable Slots */}
                {teacher.constraints?.unavailableSlots && teacher.constraints.unavailableSlots.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Horários indisponíveis:</p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.constraints.unavailableSlots.length} horário{teacher.constraints.unavailableSlots.length !== 1 ? 's' : ''} bloqueado{teacher.constraints.unavailableSlots.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeachersList;