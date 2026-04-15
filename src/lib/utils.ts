import { Mensalidade, StatusMensalidade } from '@/types';
import { format, isBefore, isEqual, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatarValor(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

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

export function formatarData(data: string | Date): string {
  if (typeof data === 'string') {
    return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR });
  }
  return format(data, 'dd/MM/yyyy', { locale: ptBR });
}

export function nomeMes(mes: number): string {
  const meses = [
    'Janeiro',
    'Fevereiro',
    'Marco',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return meses[mes - 1] ?? '';
}

// Regra unica de status:
// SE ja foi pago -> pago
// SENAO:
//   SE hoje <= vencimento -> pendente
//   SE hoje > vencimento -> atrasado
export function calcularStatus(mensalidade: Mensalidade): StatusMensalidade {
  if (mensalidade.dataPagamento) {
    return 'pago';
  }

  const hoje = startOfDay(new Date());
  const vencimento = startOfDay(parseISO(mensalidade.dataVencimento));

  if (isBefore(hoje, vencimento) || isEqual(hoje, vencimento)) {
    return 'pendente';
  }

  return 'atrasado';
}

export function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const coresStatus = {
  pago: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  pendente: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  atrasado: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
};

export const labelsStatus: Record<StatusMensalidade, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
};

export const formasPagamento = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao: 'Cartao',
  transferencia: 'Transferencia',
};

export function gerarDataVencimento(dia: number, mes: number, ano: number): string {
  const ultimoDiaMes = new Date(ano, mes, 0).getDate();
  const diaAjustado = Math.min(dia, ultimoDiaMes);
  return `${ano}-${String(mes).padStart(2, '0')}-${String(diaAjustado).padStart(2, '0')}`;
}

export function validarTelefone(telefone: string): boolean {
  const numeros = telefone.replace(/\D/g, '');
  return numeros.length >= 10 && numeros.length <= 11;
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatDistanceToNow(data: string | Date): string {
  const date = typeof data === 'string' ? parseISO(data) : data;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `ha ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `ha ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `ha ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `ha ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `ha ${diffInYears} ano${diffInYears > 1 ? 's' : ''}`;
}

