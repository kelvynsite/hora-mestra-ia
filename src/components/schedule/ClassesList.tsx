import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, Trash2, GraduationCap, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Class {
  id: string;
  name: string;
  grade: string;
  shift: string;
  school_level: string;
  created_at: string;
}

interface ClassesListProps {
  refreshKey?: number;
  onAddClass: () => void;
}

const ClassesList = ({ refreshKey, onAddClass }: ClassesListProps) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, [refreshKey]);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('grade', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        title: "Erro ao carregar turmas",
        description: "Não foi possível carregar a lista de turmas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClass = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a turma ${name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Turma excluída",
        description: `Turma ${name} foi removida do sistema.`,
      });

      loadClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Erro ao excluir turma",
        description: "Não foi possível excluir a turma.",
        variant: "destructive",
      });
    }
  };

  const getShiftLabel = (shift: string) => {
    return shift === 'morning' ? 'Manhã' : 'Tarde';
  };

  const getSchoolLevelLabel = (level: string) => {
    return level === 'fundamental2' ? 'Fundamental II' : 'Ensino Médio';
  };

  const getShiftIcon = (shift: string) => {
    return shift === 'morning' ? '🌅' : '🌇';
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando turmas...</p>
      </div>
    );
  }

  // Group classes by shift
  const morningClasses = classes.filter(c => c.shift === 'morning');
  const afternoonClasses = classes.filter(c => c.shift === 'afternoon');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-secondary" />
            Turmas
          </h2>
          <p className="text-muted-foreground">Gerencie as turmas da escola</p>
        </div>
        <Button 
          onClick={onAddClass}
          className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Criar Turma
        </Button>
      </div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie turmas para organizar os horários por série e turno.
            </p>
            <Button onClick={onAddClass} variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Criar Primeira Turma
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Morning Classes */}
          {morningClasses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🌅</span>
                <h3 className="text-xl font-semibold">Turno da Manhã</h3>
                <Badge variant="outline">{morningClasses.length} turma{morningClasses.length !== 1 ? 's' : ''}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {morningClasses.map((classItem) => (
                  <Card key={classItem.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <GraduationCap className="h-5 w-5 text-secondary" />
                            {classItem.name}
                          </CardTitle>
                          <CardDescription>
                            {classItem.grade}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteClass(classItem.id, classItem.name)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getShiftLabel(classItem.shift)}</span>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {getSchoolLevelLabel(classItem.school_level)}
                      </Badge>

                      <p className="text-xs text-muted-foreground">
                        Criada em {new Date(classItem.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Afternoon Classes */}
          {afternoonClasses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🌇</span>
                <h3 className="text-xl font-semibold">Turno da Tarde</h3>
                <Badge variant="outline">{afternoonClasses.length} turma{afternoonClasses.length !== 1 ? 's' : ''}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {afternoonClasses.map((classItem) => (
                  <Card key={classItem.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <GraduationCap className="h-5 w-5 text-secondary" />
                            {classItem.name}
                          </CardTitle>
                          <CardDescription>
                            {classItem.grade}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteClass(classItem.id, classItem.name)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getShiftLabel(classItem.shift)}</span>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {getSchoolLevelLabel(classItem.school_level)}
                      </Badge>

                      <p className="text-xs text-muted-foreground">
                        Criada em {new Date(classItem.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassesList;