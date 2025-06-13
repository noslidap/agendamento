
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const AnuncioPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const { data: anuncios = [] } = useQuery({
    queryKey: ['anuncios'],
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

  useEffect(() => {
    // Mostrar popup apenas se houver anúncios e não foi mostrado nesta sessão
    const popupShown = sessionStorage.getItem('anuncio-popup-shown');
    if (anuncios.length > 0 && !popupShown) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem('anuncio-popup-shown', 'true');
      }, 2000); // Mostrar após 2 segundos

      return () => clearTimeout(timer);
    }
  }, [anuncios]);

  const currentAd = anuncios[currentAdIndex];

  if (!currentAd) return null;

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0">
        {/* Botão fechar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPopup(false)}
          className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Conteúdo do anúncio */}
        <div className="relative">
          {currentAd.imagem_url && (
            <div className="aspect-square w-full">
              <img
                src={currentAd.imagem_url}
                alt={currentAd.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Overlay com texto */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              {currentAd.titulo}
            </h3>
            {currentAd.descricao && (
              <p className="text-gray-200 text-sm">
                {currentAd.descricao}
              </p>
            )}
          </div>
        </div>

        {/* Navegação entre anúncios se houver mais de um */}
        {anuncios.length > 1 && (
          <div className="flex justify-center gap-2 p-4 bg-gray-50">
            {anuncios.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentAdIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
