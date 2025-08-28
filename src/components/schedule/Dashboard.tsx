import { useState, useEffect } from "react";
import { Plus, Users, Clock, Calendar, BookOpen, AlertTriangle, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  teachers: number;
  classes: number;
  schedules: number;
  conflicts: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    teachers: 0,
    classes: 0,
    schedules: 0,
    conflicts: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentSchedules, setRecentSchedules] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentSchedules();
  }, []);

  const loadStats = async () => {
    try {
      const [teachersResult, classesResult, schedulesResult] = await Promise.all([
        supabase.from('teachers').select('id', { count: 'exact' }),
        supabase.from('classes').select('id', { count: 'exact' }),
        supabase.from('schedules').select('id, conflicts', { count: 'exact' })
      ]);

      const totalConflicts = schedulesResult.data?.reduce((sum, schedule) => sum + (schedule.conflicts || 0), 0) || 0;

      setStats({
        teachers: teachersResult.count || 0,
        classes: classesResult.count || 0,
        schedules: schedulesResult.count || 0,
        conflicts: totalConflicts
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentSchedules(data || []);
    } catch (error) {
      console.error('Error loading recent schedules:', error);
    }
  };

  const generateScheduleWithAI = async (shift: 'morning' | 'afternoon') => {
    setIsGenerating(true);

    try {
      const response = await supabase.functions.invoke('generate-schedule', {
        body: { shift }
      });

      if (response.error) throw response.error;

      toast({
        title: "Horário gerado com sucesso!",
        description: `Horário do turno ${shift === 'morning' ? 'da manhã' : 'da tarde'} foi criado com IA.`,
      });

      loadStats();
      loadRecentSchedules();
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Erro ao gerar horário",
        description: "Verifique se há professores e turmas cadastrados.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Sistema de Horários Escolares
          </h1>
          <p className="text-muted-foreground text-lg">
            Geração inteligente de horários com IA avançada do Google Gemini
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Professores</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teachers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.teachers === 0 ? 'Nenhum cadastrado' : 'cadastrados no sistema'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turmas</CardTitle>
              <BookOpen className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classes}</div>
              <p className="text-xs text-muted-foreground">
                {stats.classes === 0 ? 'Nenhuma criada' : 'Fundamental II e Médio'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horários Gerados</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.schedules}</div>
              <p className="text-xs text-muted-foreground">
                {stats.schedules === 0 ? 'Nenhum gerado' : 'horários salvos'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conflitos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.conflicts === 0 ? 'text-success' : 'text-warning'}`}>
                {stats.conflicts}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.conflicts === 0 ? 'Tudo perfeito!' : 'conflitos detectados'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Generate Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-elegant bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Gerar Horário com IA
              </CardTitle>
              <CardDescription>
                Use o Google Gemini para criar horários inteligentes sem conflitos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => generateScheduleWithAI('morning')}
                  disabled={isGenerating || stats.teachers === 0 || stats.classes === 0}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                >
                  {isGenerating ? "Gerando..." : "Gerar Horário Manhã"}
                </Button>
                <Button 
                  onClick={() => generateScheduleWithAI('afternoon')}
                  disabled={isGenerating || stats.teachers === 0 || stats.classes === 0}
                  className="w-full bg-gradient-to-r from-secondary to-secondary/80"
                >
                  {isGenerating ? "Gerando..." : "Gerar Horário Tarde"}
                </Button>
              </div>
              {(stats.teachers === 0 || stats.classes === 0) && (
                <p className="text-sm text-muted-foreground text-center">
                  ⚠️ Adicione professores e turmas antes de gerar horários
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                Horários Recentes
              </CardTitle>
              <CardDescription>
                Últimos horários gerados pela IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSchedules.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum horário gerado ainda
                </p>
              ) : (
                recentSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(schedule.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={schedule.status === 'active' ? 'default' : 'outline'}>
                        {schedule.status === 'active' ? 'Ativo' : 'Arquivo'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Info */}
        {stats.teachers === 0 || stats.classes === 0 ? (
          <Card className="shadow-card border-warning/50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configure o Sistema</h3>
              <p className="text-muted-foreground mb-4">
                Para começar a gerar horários, você precisa cadastrar pelo menos um professor e uma turma.
              </p>
              <div className="flex justify-center gap-3">
                {stats.teachers === 0 && (
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Adicionar Professor
                  </Button>
                )}
                {stats.classes === 0 && (
                  <Button variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Criar Turma
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-elegant bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-success">Sistema Configurado!</h3>
              <p className="text-muted-foreground">
                Você tem {stats.teachers} professor{stats.teachers !== 1 ? 'es' : ''} e {stats.classes} turma{stats.classes !== 1 ? 's' : ''} cadastrada{stats.classes !== 1 ? 's' : ''}. 
                Pronto para gerar horários inteligentes!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;