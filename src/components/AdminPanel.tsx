
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  BarChart3,
  Trash2,
  Edit,
  Image,
  MessageSquare
} from "lucide-react";
import { HorariosConfig } from "./HorariosConfig";
import { ServicosConfig } from "./ServicosConfig";
import { AnunciosConfig } from "./AnunciosConfig";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editandoStatus, setEditandoStatus] = useState<string | null>(null);
  const [novaObservacao, setNovaObservacao] = useState("");

  // Buscar agendamentos do Supabase com serviços
  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          servicos (*)
        `)
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }

      return data;
    }
  });

  const atualizarStatus = async (id: string, novoStatus: "confirmado" | "cancelado", observacao?: string) => {
    try {
      const updateData: any = { status: novoStatus };
      if (observacao) {
        updateData.observacoes = observacao;
      }

      const { error } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      setEditandoStatus(null);
      setNovaObservacao("");
      
      toast({
        title: "Status atualizado!",
        description: `Agendamento ${novoStatus === "confirmado" ? "confirmado" : "cancelado"} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const excluirAgendamento = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      
      toast({
        title: "Agendamento excluído!",
        description: "O agendamento foi removido permanentemente.",
      });
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
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

  const totalReceita = agendamentosConfirmados.reduce((total, agendamento) => {
    return total + (agendamento.servicos?.preco || 0);
  }, 0);

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">R$ {totalReceita.toFixed(2)}</p>
                  <p className="text-sm text-gray-300">Receita</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agendamentos" className="space-y-4">
          <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger value="agendamentos" className="data-[state=active]:bg-white/20 text-white">
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="servicos" className="data-[state=active]:bg-white/20 text-white">
              <Scissors className="mr-2 h-4 w-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="horarios" className="data-[state=active]:bg-white/20 text-white">
              <Settings className="mr-2 h-4 w-4" />
              Horários
            </TabsTrigger>
            <TabsTrigger value="anuncios" className="data-[state=active]:bg-white/20 text-white">
              <Image className="mr-2 h-4 w-4" />
              Anúncios
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
                {isLoading ? (
                  <p className="text-center text-gray-300 py-8">
                    Carregando agendamentos...
                  </p>
                ) : agendamentos.length === 0 ? (
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
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(agendamento.status)}>
                                {getStatusText(agendamento.status)}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => excluirAgendamento(agendamento.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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

                            {agendamento.servicos && (
                              <div className="bg-blue-900/30 rounded-lg p-3">
                                <p className="text-blue-200 text-sm">
                                  <strong>Serviço:</strong> {agendamento.servicos.nome}<br />
                                  <strong>Preço:</strong> R$ {agendamento.servicos.preco.toFixed(2)}<br />
                                  <strong>Duração:</strong> {agendamento.servicos.duracao_minutos}min
                                </p>
                              </div>
                            )}
                          </div>

                          {agendamento.observacoes && (
                            <div className="bg-orange-900/30 rounded-lg p-3 mb-4">
                              <p className="text-orange-200 text-sm">
                                <strong>Observação:</strong> {agendamento.observacoes}
                              </p>
                            </div>
                          )}

                          {editandoStatus === agendamento.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={novaObservacao}
                                onChange={(e) => setNovaObservacao(e.target.value)}
                                placeholder="Adicione uma observação (opcional)..."
                                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => atualizarStatus(agendamento.id, "confirmado", novaObservacao)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Confirmar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => atualizarStatus(agendamento.id, "cancelado", novaObservacao)}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditandoStatus(null);
                                    setNovaObservacao("");
                                  }}
                                  className="border-white/30 text-white hover:bg-white/20"
                                >
                                  Voltar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              {agendamento.status === "pendente" && (
                                <>
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
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditandoStatus(agendamento.id);
                                  setNovaObservacao(agendamento.observacoes || "");
                                }}
                                className="border-white/30 text-white hover:bg-white/20"
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Editar
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

          <TabsContent value="servicos">
            <ServicosConfig />
          </TabsContent>

          <TabsContent value="horarios">
            <HorariosConfig />
          </TabsContent>

          <TabsContent value="anuncios">
            <AnunciosConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
