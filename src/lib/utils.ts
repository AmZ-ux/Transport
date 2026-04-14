import { StatusMensalidade, Mensalidade } from '@/types';
import { format, isAfter, isBefore, isEqual, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Formatar valor em reais
export function formatarValor(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Formatar telefone (XX) XXXXX-XXXX
export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '');
  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }
  if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  return telefone;
}

// Formatar data
export function formatarData(data: string | Date): string {
  if (typeof data === 'string') {
    return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR });
  }
  return format(data, 'dd/MM/yyyy', { locale: ptBR });
}

// Obter nome do mes
export function nomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1];
}

// Calcular status da mensalidade SEGUINDO A REGRA EXATA:
// SE ja foi pago → status = "pago"
// SENAO:
//     SE hoje <= vencimento → status = "pendente"
//     SE hoje > vencimento → status = "atrasado"
export function calcularStatus(mensalidade: Mensalidade): StatusMensalidade {
  // Se ja foi pago, status e pago
  if (mensalidade.dataPagamento) {
    return 'pago';
  }

  const hoje = startOfDay(new Date());
  const vencimento = startOfDay(parseISO(mensalidade.dataVencimento));

  // SE hoje <= vencimento → pendente
  if (isBefore(hoje, vencimento) || isEqual(hoje, vencimento)) {
    return 'pendente';
  }

  // SE hoje > vencimento → atrasado
  return 'atrasado';
}

// Gerar ID unico
export function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Cores para status
export const coresStatus = {
  pago: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  pendente: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
  atrasado: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
};

// Label para status
export const labelsStatus = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
};

// Formas de pagamento
export const formasPagamento = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao: 'Cartao',
  transferencia: 'Transferencia',
};

// Gerar data de vencimento baseada no dia
export function gerarDataVencimento(dia: number, mes: number, ano: number): string {
  // Ajustar se o dia nao existir no mes (ex: dia 31 em meses com 30 dias)
  const ultimoDiaMes = new Date(ano, mes, 0).getDate();
  const diaAjustado = Math.min(dia, ultimoDiaMes);
  return `${ano}-${String(mes).padStart(2, '0')}-${String(diaAjustado).padStart(2, '0')}`;
}

// Validar telefone
export function validarTelefone(telefone: string): boolean {
  const numeros = telefone.replace(/\D/g, '');
  return numeros.length >= 10 && numeros.length <= 11;
}

// Validar email
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Formatar data relativa (ex: "há 2 dias")
export function formatDistanceToNow(data: string | Date): string {
  const date = typeof data === 'string' ? parseISO(data) : data;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `há ${diffInMonths} mês${diffInMonths > 1 ? 'es' : ''}`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `há ${diffInYears} ano${diffInYears > 1 ? 's' : ''}`;
}
