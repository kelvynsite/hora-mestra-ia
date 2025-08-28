import { useState } from "react";
import Dashboard from "@/components/schedule/Dashboard";
import TeacherForm from "@/components/schedule/TeacherForm";
import ClassForm from "@/components/schedule/ClassForm";
import ScheduleViewer from "@/components/schedule/ScheduleViewer";
import TeachersList from "@/components/schedule/TeachersList";
import ClassesList from "@/components/schedule/ClassesList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, Calendar, Settings, History } from "lucide-react";

const Index = () => {
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

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
              <Dashboard key={refreshKey} />
            </TabsContent>

            <TabsContent value="teachers">
              <div className="p-6">
                <TeachersList 
                  refreshKey={refreshKey} 
                  onAddTeacher={() => setShowTeacherForm(true)}
                />
              </div>
            </TabsContent>

            <TabsContent value="classes">
              <div className="p-6">
                <ClassesList 
                  refreshKey={refreshKey} 
                  onAddClass={() => setShowClassForm(true)}
                />
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <div className="p-6">
                <ScheduleViewer />
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="p-6">
                <ScheduleViewer />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

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
