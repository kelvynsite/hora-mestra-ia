import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, User, Calendar, Users, BookOpen, History, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Dashboard from "@/components/schedule/Dashboard";
import TeachersList from "@/components/schedule/TeachersList";
import ClassesList from "@/components/schedule/ClassesList";
import ScheduleViewer from "@/components/schedule/ScheduleViewer";
import TeacherForm from "@/components/schedule/TeacherForm";
import ClassForm from "@/components/schedule/ClassForm";
import ApiSettings from "@/components/settings/ApiSettings";

interface IndexProps {
  user: SupabaseUser;
}

const Index = ({ user }: IndexProps) => {
  const { toast } = useToast();
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Sistema de Horários</h1>
            <p className="text-sm text-muted-foreground">Gerador inteligente de horários escolares</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {user.email}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
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
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Horários
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard key={refreshKey} />
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <TeachersList 
              refreshKey={refreshKey} 
              onAddTeacher={() => setShowTeacherForm(true)}
            />
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <ClassesList 
              refreshKey={refreshKey} 
              onAddClass={() => setShowClassForm(true)}
            />
          </TabsContent>

          <TabsContent value="schedules" className="space-y-6">
            <ScheduleViewer key={`schedules-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ScheduleViewer key={`history-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ApiSettings />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      {showTeacherForm && (
        <TeacherForm 
          onClose={() => setShowTeacherForm(false)} 
          onSave={handleDataRefresh}
        />
      )}
      
      {showClassForm && (
        <ClassForm 
          onClose={() => setShowClassForm(false)} 
          onSave={handleDataRefresh}
        />
      )}
    </div>
  );
};

export default Index;