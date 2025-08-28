import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, User, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeacherFormProps {
  onClose: () => void;
  onSave?: () => void;
}

const TeacherForm = ({ onClose, onSave }: TeacherFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [maxDailyClasses, setMaxDailyClasses] = useState("5");
  const [preferences, setPreferences] = useState("");
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  const timeSlots = [
    "07:00 - 07:50", "08:00 - 08:50", "09:00 - 09:50", "10:10 - 11:00", 
    "11:10 - 12:00", "13:00 - 13:50", "14:00 - 14:50", "15:00 - 15:50", 
    "16:00 - 16:50", "17:00 - 17:50"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const constraints = {
        preferences,
        unavailableSlots,
        subjects
      };

      const { error } = await supabase
        .from('teachers')
        .insert({
          name: name.trim(),
          subject: subjects[0] || "", // Primary subject
          max_daily_classes: parseInt(maxDailyClasses),
          constraints
        });

      if (error) throw error;

      toast({
        title: "Professor adicionado com sucesso!",
        description: `${name} foi cadastrado no sistema.`,
      });

      onSave?.();
      onClose();
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast({
        title: "Erro ao adicionar professor",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-elegant">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Adicionar Professor
              </CardTitle>
              <CardDescription>
                Cadastre um novo professor com suas matérias e preferências
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Professor *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                required
              />
            </div>

            {/* Matérias */}
            <div className="space-y-3">
              <Label>Matérias que Leciona *</Label>
              <div className="flex gap-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ex: Matemática"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                />
                <Button type="button" onClick={addSubject} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeSubject(subject)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Máximo de aulas por dia */}
            <div className="space-y-2">
              <Label htmlFor="maxClasses">Máximo de Aulas por Dia</Label>
              <Select value={maxDailyClasses} onValueChange={setMaxDailyClasses}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1} aula{i === 0 ? '' : 's'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Horários indisponíveis */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horários Indisponíveis
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <label key={slot} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={unavailableSlots.includes(slot)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUnavailableSlots([...unavailableSlots, slot]);
                        } else {
                          setUnavailableSlots(unavailableSlots.filter(s => s !== slot));
                        }
                      }}
                      className="rounded border-input"
                    />
                    <span>{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferências especiais */}
            <div className="space-y-2">
              <Label htmlFor="preferences">Exigências/Preferências Especiais</Label>
              <Textarea
                id="preferences"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Ex: Prefere dar aulas no período da manhã, não pode ter aulas consecutivas, etc."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                disabled={!name.trim() || subjects.length === 0 || isLoading}
              >
                {isLoading ? "Salvando..." : "Salvar Professor"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default TeacherForm;