import { useState } from "react";
import Dashboard from "@/components/schedule/Dashboard";
import TeacherForm from "@/components/schedule/TeacherForm";
import ClassForm from "@/components/schedule/ClassForm";
import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, Calendar, Settings, History } from "lucide-react";

const Index = () => {
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Professores
              </TabsTrigger>
              <TabsTrigger value="classes" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Turmas
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Horários
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>

            <TabsContent value="teachers">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Professores</h2>
                  <Button 
                    onClick={() => setShowTeacherForm(true)}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Adicionar Professor
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  ⚠️ Para funcionalidades completas de professores, conecte ao Supabase
                </p>
              </div>
            </TabsContent>

            <TabsContent value="classes">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Turmas</h2>
                  <Button 
                    onClick={() => setShowClassForm(true)}
                    className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Criar Turma
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  ⚠️ Para funcionalidades completas de turmas, conecte ao Supabase
                </p>
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <div className="p-6">
                <ScheduleGrid />
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Histórico de Horários</h2>
                <p className="text-muted-foreground">
                  ⚠️ Para histórico completo, conecte ao Supabase
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      {showTeacherForm && (
        <TeacherForm onClose={() => setShowTeacherForm(false)} />
      )}
      
      {showClassForm && (
        <ClassForm onClose={() => setShowClassForm(false)} />
      )}
    </div>
  );
};

export default Index;
