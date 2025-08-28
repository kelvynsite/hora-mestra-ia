import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Download, Edit, Calendar, FileText, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Schedule {
  id: string;
  name: string;
  schedule_data: any;
  conflicts: number;
  status: string;
  created_at: string;
}

const ScheduleViewer = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSchedules(data || []);
      if (data && data.length > 0) {
        setSelectedSchedule(data[0]);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast({
        title: "Erro ao carregar horários",
        description: "Não foi possível carregar os horários salvos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSchedule = async (format: 'pdf' | 'jpg') => {
    if (!selectedSchedule) return;

    try {
      // Here you would implement the download logic
      // For now, we'll show a success message
      toast({
        title: `Download ${format.toUpperCase()} iniciado`,
        description: `O horário será baixado em formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error downloading schedule:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível fazer o download do horário.",
        variant: "destructive",
      });
    }
  };

  const renderScheduleGrid = () => {
    if (!selectedSchedule?.schedule_data?.schedule) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum horário selecionado ou dados indisponíveis</p>
        </div>
      );
    }

    const scheduleData = selectedSchedule.schedule_data.schedule;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const timeSlots = [
      "07:00 - 07:50",
      "08:00 - 08:50", 
      "09:00 - 09:50",
      "09:50 - 10:10", // Recreio
      "10:10 - 11:00",
      "11:10 - 12:00"
    ];

    // Get all classes from the schedule
    const classes = Object.keys(scheduleData);

    return (
      <div className="space-y-6">
        {classes.map((classId) => (
          <Card key={classId} className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Turma {classId}</CardTitle>
              <CardDescription>Horário semanal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-3 bg-muted text-left font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Horário
                        </div>
                      </th>
                      {dayNames.map((day) => (
                        <th key={day} className="border border-border p-3 bg-muted text-center font-medium min-w-[150px]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time, timeIndex) => (
                      <tr key={time} className={time.includes("RECREIO") || time.includes("10:10") ? "bg-accent/20" : ""}>
                        <td className="border border-border p-3 font-medium bg-card">
                          {time}
                        </td>
                        {days.map((day) => {
                          const classSchedule = scheduleData[classId]?.[day];
                          const lesson = classSchedule?.find((l: any) => l.time_slot === timeIndex + 1);
                          
                          if (time.includes("09:50 - 10:10")) {
                            return (
                              <td key={day} className="border border-border p-3 text-center">
                                <Badge variant="outline" className="bg-accent/30 text-accent-foreground">
                                  RECREIO
                                </Badge>
                              </td>
                            );
                          }

                          return (
                            <td key={day} className="border border-border p-3">
                              {lesson ? (
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">{lesson.subject}</div>
                                  <div className="text-xs text-muted-foreground">Prof. {lesson.teacher_id}</div>
                                </div>
                              ) : (
                                <div className="text-center text-muted-foreground text-sm">
                                  Livre
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando horários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Visualizar Horários
          </h2>
          <p className="text-muted-foreground">Veja e baixe os horários gerados</p>
        </div>
        
        {selectedSchedule && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadSchedule('pdf')}>
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadSchedule('jpg')}>
              <Camera className="mr-2 h-4 w-4" />
              Download JPG
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        )}
      </div>

      {/* Schedule Selection */}
      {schedules.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Selecionar Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Select 
                  value={selectedSchedule?.id || ""} 
                  onValueChange={(value) => {
                    const schedule = schedules.find(s => s.id === value);
                    setSelectedSchedule(schedule || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.map((schedule) => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {schedule.name} - {new Date(schedule.created_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSchedule && (
                <div className="flex items-center gap-2">
                  <Badge variant={selectedSchedule.status === 'active' ? 'default' : 'outline'}>
                    {selectedSchedule.status === 'active' ? 'Ativo' : 'Arquivo'}
                  </Badge>
                  <Badge variant="outline">
                    {selectedSchedule.conflicts === 0 ? '✓ Sem conflitos' : `⚠ ${selectedSchedule.conflicts} conflitos`}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Grid */}
      {schedules.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum horário encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Gere um horário primeiro no Dashboard para visualizá-lo aqui.
            </p>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        renderScheduleGrid()
      )}
    </div>
  );
};

export default ScheduleViewer;