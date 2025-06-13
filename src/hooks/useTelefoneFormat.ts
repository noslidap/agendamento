
import { useState } from 'react';

export const useTelefoneFormat = (initialValue: string = '') => {
  const [telefone, setTelefone] = useState(initialValue);

  const formatTelefone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  const handleTelefoneChange = (value: string) => {
    const formatted = formatTelefone(value);
    setTelefone(formatted);
  };

  const getTelefoneNumbers = () => {
    return telefone.replace(/\D/g, '');
  };

  const isValidTelefone = () => {
    return getTelefoneNumbers().length === 11;
  };

  return {
    telefone,
    setTelefone,
    handleTelefoneChange,
    getTelefoneNumbers,
    isValidTelefone,
    formatTelefone
  };
};
