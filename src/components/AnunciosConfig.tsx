
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const AnunciosConfig = () => {
  const [novoAnuncio, setNovoAnuncio] = useState({
    titulo: "",
    descricao: "",
    imagem_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: anuncios = [] } = useQuery({
    queryKey: ['anuncios-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar anúncios:', error);
        return [];
      }
      
      return data;
    }
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Por enquanto, vou simular o upload usando uma URL de exemplo
      // Em produção, você implementaria o upload real para o Supabase Storage
      const imageUrl = URL.createObjectURL(file);
      setNovoAnuncio({...novoAnuncio, imagem_url: imageUrl});
      
      toast({
        title: "Sucesso!",
        description: "Imagem carregada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const adicionarAnuncio = async () => {
    if (!novoAnuncio.titulo) {
      toast({
        title: "Erro",
        description: "Título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('anuncios')
        .insert([{
          titulo: novoAnuncio.titulo,
          descricao: novoAnuncio.descricao,
          imagem_url: novoAnuncio.imagem_url
        }]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['anuncios-config'] });
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      setNovoAnuncio({ titulo: "", descricao: "", imagem_url: "" });
      
      toast({
        title: "Sucesso!",
        description: "Anúncio adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar anúncio:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar anúncio. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const removerAnuncio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('anuncios')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['anuncios-config'] });
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      
      toast({
        title: "Sucesso!",
        description: "Anúncio removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover anúncio:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover anúncio. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Image className="mr-2 h-5 w-5" />
          Gerenciar Anúncios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adicionar novo anúncio */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Criar Novo Anúncio
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tituloAnuncio" className="text-white">
                Título do Anúncio *
              </Label>
              <Input
                id="tituloAnuncio"
                value={novoAnuncio.titulo}
                onChange={(e) => setNovoAnuncio({...novoAnuncio, titulo: e.target.value})}
                placeholder="Ex: Promoção Especial"
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="descricaoAnuncio" className="text-white">
                Descrição
              </Label>
              <Textarea
                id="descricaoAnuncio"
                value={novoAnuncio.descricao}
                onChange={(e) => setNovoAnuncio({...novoAnuncio, descricao: e.target.value})}
                placeholder="Descrição do anúncio..."
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="imagemAnuncio" className="text-white">
                Imagem do Anúncio (1:1 - Quadrada)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="imagemAnuncio"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="bg-white/20 border-white/30 text-white file:text-white"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="border-white/30 text-white hover:bg-white/20"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {novoAnuncio.imagem_url && (
                <div className="mt-2">
                  <img 
                    src={novoAnuncio.imagem_url} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded border border-white/30"
                  />
                </div>
              )}
            </div>
            <Button
              onClick={adicionarAnuncio}
              className="bg-green-600 hover:bg-green-700 w-full"
              disabled={uploading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {uploading ? "Processando..." : "Criar Anúncio"}
            </Button>
          </div>
        </div>

        {/* Lista de anúncios */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Anúncios Ativos ({anuncios.length})
          </h3>
          
          {anuncios.length === 0 ? (
            <p className="text-center text-gray-300 py-8">
              Nenhum anúncio cadastrado.
            </p>
          ) : (
            <div className="space-y-3">
              {anuncios.map((anuncio) => (
                <div
                  key={anuncio.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4 flex-1">
                      {anuncio.imagem_url && (
                        <img 
                          src={anuncio.imagem_url} 
                          alt={anuncio.titulo}
                          className="w-16 h-16 object-cover rounded border border-white/30"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">{anuncio.titulo}</h4>
                        {anuncio.descricao && (
                          <p className="text-gray-300 text-sm">{anuncio.descricao}</p>
                        )}
                        <Badge className="bg-green-100 text-green-800 mt-2">
                          Ativo
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerAnuncio(anuncio.id)}
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
