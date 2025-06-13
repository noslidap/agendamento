
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Users, Phone, Scissors, Star } from "lucide-react";
import { AgendamentoModal } from "./AgendamentoModal";
import { ConsultaModal } from "./ConsultaModal";
import { AnuncioPopup } from "./AnuncioPopup";

interface LandingPageProps {
  onAdminClick: () => void;
}

export const LandingPage = ({ onAdminClick }: LandingPageProps) => {
  const [showAgendamento, setShowAgendamento] = useState(false);
  const [showConsulta, setShowConsulta] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Pop-up de Anúncios */}
      <AnuncioPopup />
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">BarberApp</h1>
          </div>
          <Button 
            variant="ghost" 
            onClick={onAdminClick}
            className="text-white hover:bg-white/20"
          >
            Área do Barbeiro
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-400 bg-clip-text text-transparent">
              Agende seu Horário
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-300 leading-relaxed">
              Sistema profissional de agendamento para barbearias.<br />
              <strong>Agende diretamente com seu barbeiro de forma fácil e rápida!</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={() => setShowAgendamento(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                <Calendar className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                Agendar Horário
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowConsulta(true)}
                className="border-white text-white hover:bg-white hover:text-black px-6 md:px-8 py-3 md:py-4 text-base md:text-lg transition-all duration-200 w-full sm:w-auto"
              >
                <Phone className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                Consultar Agendamentos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
            Por que usar nosso sistema?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Clock className="h-10 md:h-12 w-10 md:w-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-lg md:text-xl font-semibold mb-2">Agendamento Rápido</h4>
                <p className="text-gray-300 text-sm md:text-base">
                  Agende seu horário em menos de 2 minutos, de forma simples e intuitiva.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Users className="h-10 md:h-12 w-10 md:w-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-lg md:text-xl font-semibold mb-2">Gestão Profissional</h4>
                <p className="text-gray-300 text-sm md:text-base">
                  Sistema completo para barbeiros gerenciarem seus agendamentos e horários.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Star className="h-10 md:h-12 w-10 md:w-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-lg md:text-xl font-semibold mb-2">Experiência Premium</h4>
                <p className="text-gray-300 text-sm md:text-base">
                  Interface moderna e responsiva, funciona perfeitamente no celular.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black/30 text-center text-gray-400">
        <div className="container mx-auto px-4">
          <p className="text-sm md:text-base">
            &copy; 2024 BarberApp. Sistema profissional de agendamento para barbearias.
          </p>
        </div>
      </footer>

      {/* Modais */}
      <AgendamentoModal 
        open={showAgendamento} 
        onOpenChange={setShowAgendamento} 
      />
      
      <ConsultaModal 
        open={showConsulta} 
        onOpenChange={setShowConsulta} 
      />
    </div>
  );
};
