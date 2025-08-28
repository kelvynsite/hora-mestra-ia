import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Download, Edit, Calendar } from "lucide-react";

const ScheduleGrid = () => {
  const timeSlots = [
    "07:00 - 07:50",
    "08:00 - 08:50", 
    "09:00 - 09:50",
    "09:50 - 10:10", // Recreio
    "10:10 - 11:00",
    "11:10 - 12:00"
  ];

  const classes = ["6ºA", "6ºB", "7ºA", "7ºB", "8ºA"];

  const mockSchedule = {
    "6ºA": {
      "07:00 - 07:50": { subject: "Matemática", teacher: "Prof. Silva" },
      "08:00 - 08:50": { subject: "Português", teacher: "Prof. Maria" },
      "09:00 - 09:50": { subject: "História", teacher: "Prof. João" },
      "09:50 - 10:10": { subject: "RECREIO", teacher: "" },
      "10:10 - 11:00": { subject: "Ciências", teacher: "Prof. Ana" },
      "11:10 - 12:00": { subject: "Educação Física", teacher: "Prof. Carlos" }
    },
    "6ºB": {
      "07:00 - 07:50": { subject: "Português", teacher: "Prof. Maria" },
      "08:00 - 08:50": { subject: "Matemática", teacher: "Prof. Silva" },
      "09:00 - 09:50": { subject: "Ciências", teacher: "Prof. Ana" },
      "09:50 - 10:10": { subject: "RECREIO", teacher: "" },
      "10:10 - 11:00": { subject: "História", teacher: "Prof. João" },
      "11:10 - 12:00": { subject: "Arte", teacher: "Prof. Lucia" }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Grade de Horários
          </h2>
          <p className="text-muted-foreground">Turno da Manhã - 6º ao 8º Ano</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Segunda-feira</CardTitle>
          <CardDescription>Grade gerada com IA - 0 conflitos detectados</CardDescription>
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
                  {classes.map((className) => (
                    <th key={className} className="border border-border p-3 bg-muted text-center font-medium min-w-[150px]">
                      {className}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className={time.includes("RECREIO") ? "bg-accent/20" : ""}>
                    <td className="border border-border p-3 font-medium bg-card">
                      {time}
                    </td>
                    {classes.map((className) => {
                      const classSchedule = mockSchedule[className as keyof typeof mockSchedule];
                      const lesson = classSchedule?.[time] || { subject: "Livre", teacher: "" };
                      
                      if (time.includes("RECREIO")) {
                        return (
                          <td key={className} className="border border-border p-3 text-center">
                            <Badge variant="outline" className="bg-accent/30 text-accent-foreground">
                              RECREIO
                            </Badge>
                          </td>
                        );
                      }

                      return (
                        <td key={className} className="border border-border p-3">
                          {lesson.subject !== "Livre" ? (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{lesson.subject}</div>
                              <div className="text-xs text-muted-foreground">{lesson.teacher}</div>
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

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <div>
                <p className="font-medium">Status: Ativo</p>
                <p className="text-sm text-muted-foreground">Sem conflitos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">5 aulas/turma</p>
                <p className="text-sm text-muted-foreground">Carga horária completa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">IA</Badge>
              <div>
                <p className="font-medium">Gerado com IA</p>
                <p className="text-sm text-muted-foreground">Google Gemini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScheduleGrid;