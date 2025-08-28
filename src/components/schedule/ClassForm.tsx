import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, BookOpen } from "lucide-react";

interface ClassFormProps {
  onClose: () => void;
}

const ClassForm = ({ onClose }: ClassFormProps) => {
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [shift, setShift] = useState("");
  const [studentsCount, setStudentsCount] = useState("");

  const grades = ["6º Ano", "7º Ano", "8º Ano", "9º Ano", "1º Ano", "2º Ano", "3º Ano"];
  const sections = ["A", "B", "C", "D", "E"];
  const shifts = ["Manhã", "Tarde"];

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
        
        <CardContent className="space-y-4">
          {/* Série */}
          <div className="space-y-2">
            <Label htmlFor="grade">Série</Label>
            <Select value={grade} onValueChange={setGrade}>
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
            <Label htmlFor="section">Turma (Letra)</Label>
            <Select value={section} onValueChange={setSection}>
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
            <Label htmlFor="shift">Turno</Label>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o turno" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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
                Turno: {shift} | Alunos: {studentsCount || "não informado"}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
              disabled={!grade || !section || !shift}
            >
              Criar Turma
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassForm;