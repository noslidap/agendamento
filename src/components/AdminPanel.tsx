
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  LogOut, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Scissors,
  Settings,
  BarChart3 
} from "lucide-react";
import { HorariosConfig } from "./HorariosConfig";

interface AgendamentoType {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  data: string;
  horario: string;
  status: "pendente" | "confirmado" | "cancelado";
}

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const [agendamentos, setAgendamentos] = useState<AgendamentoType[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = () => {
    const agendamentosSalvos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    // Ordenar por data e horário
    agendamentosSalvos.sort((a: AgendamentoType, b: AgendamentoType) => {
      const dateA = new Date(a.data + " " + a.horario);
      const dateB = new Date(b.data + " " + b.horario);
      return dateA.getTime() - dateB.getTime();
    });
    setAgendamentos(agendamentosSalvos);
  };

  const atualizarStatus = (id: number, novoStatus: "confirmado" | "cancelado") => {
    const agendamentosAtualizados = agendamentos.map(agendamento =>
      agendamento.id === id 
        ? { ...agendamento, status: novoStatus }
        : agendamento
    );
    
    setAgendamentos(agendamentosAtualizados);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtualizados));
    
    toast({
      title: "Status atualizado!",
      description: `Agendamento ${novoStatus === "confirmado" ? "confirmado" : "cancelado"} com sucesso.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmado":
        return "Confirmado";
      case "cancelado":
        return "Cancelado";
      default:
        return "Pendente";
    }
  };

  const agendamentosPendentes = agendamentos.filter(a => a.status === "pendente");
  const agendamentosConfirmados = agendamentos.filter(a => a.status === "confirmado");
  const agendamentosCancelados = agendamentos.filter(a => a.status === "cancelado");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">BarberApp</h1>
              <p className="text-sm text-gray-300">Painel Administrativo</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{agendamentos.length}</p>
                  <p className="text-sm text-gray-300">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-white">{agendamentosPendentes.length}</p>
                  <p className="text-sm text-gray-300">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{agendamentosConfirmados.length}</p>
                  <p className="text-sm text-gray-300">Confirmados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <X className="h-8 w-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{agendamentosCancelados.length}</p>
                  <p className="text-sm text-gray-300">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agendamentos" className="space-y-4">
          <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger value="agendamentos" className="data-[state=active]:bg-white/20">
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="horarios" className="data-[state=active]:bg-white/20">
              <Settings className="mr-2 h-4 w-4" />
              Configurar Horários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agendamentos">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  Todos os Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agendamentos.length === 0 ? (
                  <p className="text-center text-gray-300 py-8">
                    Nenhum agendamento encontrado.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {agendamentos.map((agendamento) => (
                      <Card key={agendamento.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-2">
                              <User className="h-5 w-5 text-gray-400" />
                              <span className="font-semibold text-white text-lg">
                                {agendamento.nome}
                              </span>
                            </div>
                            <Badge className={getStatusColor(agendamento.status)}>
                              {getStatusText(agendamento.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-gray-300">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {format(new Date(agendamento.data), "dd 'de' MMMM 'de' yyyy", { 
                                    locale: ptBR 
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-300">
                                <Clock className="h-4 w-4" />
                                <span>{agendamento.horario}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-gray-300">
                                <Phone className="h-4 w-4" />
                                <span>{agendamento.telefone}</span>
                              </div>
                              {agendamento.email && (
                                <div className="flex items-center space-x-2 text-gray-300">
                                  <Mail className="h-4 w-4" />
                                  <span className="truncate">{agendamento.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {agendamento.status === "pendente" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => atualizarStatus(agendamento.id, "confirmado")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => atualizarStatus(agendamento.id, "cancelado")}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="horarios">
            <HorariosConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
