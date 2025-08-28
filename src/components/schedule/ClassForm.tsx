import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClassFormProps {
  onClose: () => void;
  onSave?: () => void;
}

const ClassForm = ({ onClose, onSave }: ClassFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [shift, setShift] = useState("");
  const [studentsCount, setStudentsCount] = useState("");

  const grades = ["6º Ano", "7º Ano", "8º Ano", "9º Ano", "1º Ano", "2º Ano", "3º Ano"];
  const sections = ["A", "B", "C", "D", "E"];
  const shifts = [
    { value: "morning", label: "Manhã" },
    { value: "afternoon", label: "Tarde" }
  ];

  const getSchoolLevel = (grade: string) => {
    if (["6º Ano", "7º Ano", "8º Ano", "9º Ano"].includes(grade)) {
      return "fundamental2";
    }
    return "medio";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const className = `${grade.replace(" Ano", "")}${section}`;
      
      const { error } = await supabase
        .from('classes')
        .insert({
          name: className,
          grade: grade,
          shift: shift,
          school_level: getSchoolLevel(grade)
        });

      if (error) throw error;

      toast({
        title: "Turma criada com sucesso!",
        description: `Turma ${className} foi adicionada ao sistema.`,
      });

      onSave?.();
      onClose();
    } catch (error) {
      console.error("Error adding class:", error);
      toast({
        title: "Erro ao criar turma",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                Criar Turma
              </CardTitle>
              <CardDescription>
                Adicione uma nova turma ao sistema
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Série */}
            <div className="space-y-2">
              <Label htmlFor="grade">Série *</Label>
              <Select value={grade} onValueChange={setGrade} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a série" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Turma (Letra) */}
            <div className="space-y-2">
              <Label htmlFor="section">Turma (Letra) *</Label>
              <Select value={section} onValueChange={setSection} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a letra" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Turno */}
            <div className="space-y-2">
              <Label htmlFor="shift">Turno *</Label>
              <Select value={shift} onValueChange={setShift} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantidade de alunos */}
            <div className="space-y-2">
              <Label htmlFor="students">Quantidade de Alunos</Label>
              <Input
                id="students"
                type="number"
                value={studentsCount}
                onChange={(e) => setStudentsCount(e.target.value)}
                placeholder="Ex: 30"
                min="1"
                max="50"
              />
            </div>

            {/* Preview */}
            {grade && section && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Preview da turma:</p>
                <p className="font-medium text-lg">
                  {grade.replace(" Ano", "")} - {section}
                </p>
                <p className="text-sm text-muted-foreground">
                  Turno: {shifts.find(s => s.value === shift)?.label || shift} | 
                  Nível: {getSchoolLevel(grade) === "fundamental2" ? "Fundamental II" : "Ensino Médio"}
                  {studentsCount && ` | Alunos: ${studentsCount}`}
                </p>
              </div>
            )}

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
                className="flex-1 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
                disabled={!grade || !section || !shift || isLoading}
              >
                {isLoading ? "Criando..." : "Criar Turma"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default ClassForm;