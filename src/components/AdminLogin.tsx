
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Scissors } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLogin = ({ onLogin, onBack }: AdminLoginProps) => {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Credenciais simples para demo (em produção usar autenticação real)
    if (usuario === "barbeiro" && senha === "123456") {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao painel administrativo.",
      });
      onLogin();
    } else {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o site
          </Button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scissors className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">BarberApp</h1>
          </div>
          <p className="text-gray-300">Área do Barbeiro</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-center text-white text-xl">
              Login Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-white">
                  Usuário
                </Label>
                <Input
                  id="usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Digite seu usuário"
                  required
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-white">
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
              >
                Entrar
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
              <p className="text-sm text-center text-gray-300 mb-2">
                <strong>Credenciais para demonstração:</strong>
              </p>
              <p className="text-xs text-center text-gray-400">
                Usuário: <span className="font-mono">barbeiro</span><br />
                Senha: <span className="font-mono">123456</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
