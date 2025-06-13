
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const ServicosConfig = () => {
  const [novoServico, setNovoServico] = useState({
    nome: "",
    descricao: "",
    preco: "",
    duracao_minutos: "30"
  });
  const [editandoServico, setEditandoServico] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar serviços:', error);
        return [];
      }
      
      return data;
    }
  });

  const adicionarServico = async () => {
    if (!novoServico.nome || !novoServico.preco) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('servicos')
        .insert([{
          nome: novoServico.nome,
          descricao: novoServico.descricao,
          preco: parseFloat(novoServico.preco),
          duracao_minutos: parseInt(novoServico.duracao_minutos)
        }]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['servicos-config'] });
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      setNovoServico({ nome: "", descricao: "", preco: "", duracao_minutos: "30" });
      
      toast({
        title: "Sucesso!",
        description: "Serviço adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const removerServico = async (id: string) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['servicos-config'] });
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      
      toast({
        title: "Sucesso!",
        description: "Serviço removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Scissors className="mr-2 h-5 w-5" />
          Gerenciar Serviços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adicionar novo serviço */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Adicionar Novo Serviço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeServico" className="text-white">
                Nome do Serviço *
              </Label>
              <Input
                id="nomeServico"
                value={novoServico.nome}
                onChange={(e) => setNovoServico({...novoServico, nome: e.target.value})}
                placeholder="Ex: Corte + Barba"
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="precoServico" className="text-white">
                Preço (R$) *
              </Label>
              <Input
                id="precoServico"
                type="number"
                step="0.01"
                min="0"
                value={novoServico.preco}
                onChange={(e) => setNovoServico({...novoServico, preco: e.target.value})}
                placeholder="25.00"
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duracaoServico" className="text-white">
                Duração (minutos)
              </Label>
              <Input
                id="duracaoServico"
                type="number"
                min="1"
                value={novoServico.duracao_minutos}
                onChange={(e) => setNovoServico({...novoServico, duracao_minutos: e.target.value})}
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={adicionarServico}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="descricaoServico" className="text-white">
              Descrição (opcional)
            </Label>
            <Textarea
              id="descricaoServico"
              value={novoServico.descricao}
              onChange={(e) => setNovoServico({...novoServico, descricao: e.target.value})}
              placeholder="Descrição do serviço..."
              className="bg-white/20 border-white/30 text-white placeholder-gray-300"
            />
          </div>
        </div>

        {/* Lista de serviços */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Serviços Cadastrados ({servicos.length})
          </h3>
          
          {servicos.length === 0 ? (
            <p className="text-center text-gray-300 py-8">
              Nenhum serviço cadastrado.
            </p>
          ) : (
            <div className="space-y-3">
              {servicos.map((servico) => (
                <div
                  key={servico.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">{servico.nome}</h4>
                        <Badge className="bg-green-100 text-green-800">
                          R$ {servico.preco.toFixed(2)}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {servico.duracao_minutos}min
                        </Badge>
                      </div>
                      {servico.descricao && (
                        <p className="text-gray-300 text-sm">{servico.descricao}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerServico(servico.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
