import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, Save, Check } from "lucide-react";

const ApiSettings = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Verificar se já existe uma API key salva
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setHasApiKey(true);
      setApiKey('***************************' + savedKey.slice(-4));
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira sua API key do Google Gemini.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      toast({
        title: "API Key inválida",
        description: "A API key do Google Gemini deve começar com 'AIza'.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Salvar no localStorage (em produção seria melhor usar um backend seguro)
      localStorage.setItem('gemini_api_key', apiKey);
      setHasApiKey(true);
      setApiKey('***************************' + apiKey.slice(-4));

      toast({
        title: "API Key salva com sucesso!",
        description: "Agora você pode gerar horários inteligentes com IA.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar API Key",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditApiKey = () => {
    setHasApiKey(false);
    setApiKey("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" />
          Configurações da API
        </h2>
        <p className="text-muted-foreground">Configure sua API key do Google Gemini para geração inteligente de horários</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Google Gemini API
          </CardTitle>
          <CardDescription>
            Sua API key permite que o sistema use inteligência artificial para gerar horários otimizados.
            <br />
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              Obtenha sua API key aqui →
            </a>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {hasApiKey ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-green-700 dark:text-green-300">API Key configurada com sucesso</span>
              </div>
              
              <div className="space-y-2">
                <Label>API Key atual</Label>
                <div className="flex gap-2">
                  <Input
                    value={apiKey}
                    disabled
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={handleEditApiKey}>
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Google Gemini API Key *</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSyB..."
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Sua API key será armazenada localmente e não será compartilhada.
                </p>
              </div>

              <Button 
                onClick={handleSaveApiKey}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar API Key"}
              </Button>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Como obter sua API Key:</h4>
            <ol className="text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
              <li>Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
              <li>Faça login com sua conta Google</li>
              <li>Clique em "Create API key"</li>
              <li>Copie a chave gerada e cole aqui</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiSettings;