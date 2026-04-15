export type TipoUsuario = 'admin' | 'aluno';

export type StatusMensalidade = 'pago' | 'pendente' | 'atrasado';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  dataCadastro: string;
  ativo: boolean;
}

export interface Aluno {
  id: string;
  nome: string;
  usuarioId: string;
  usuario?: Usuario;
  telefone: string;
  endereco?: string;
  curso: string;
  faculdade: string;
  pontoEmbarque: string;
  turno?: 'manha' | 'noite';
  valorMensalidade: number;
  diaVencimento: number;
  ativo: boolean;
  dataCadastro: string;
}

export interface ComprovantePagamento {
  id: string;
  arquivoBase64: string;
  nomeArquivo: string;
  tipoArquivo: string;
  dataEnvio: string;
  observacao?: string;
}

export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao' | 'transferencia';

export interface Mensalidade {
  id: string;
  alunoId: string;
  aluno?: Aluno;
  mesReferencia: number;
  anoReferencia: number;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  formaPagamento?: FormaPagamento;
  status: StatusMensalidade;
  observacoes?: string;
  comprovante?: ComprovantePagamento;
}

export interface Notificacao {
  id: string;
  alunoId: string;
  mensalidadeId?: string;
  tipo: 'lembrete' | 'vencimento' | 'atraso' | 'confirmacao';
  titulo: string;
  mensagem: string;
  dataEnvio: string;
  lida: boolean;
  link?: string;
}

export interface DashboardStats {
  totalReceberMes: number;
  totalRecebido: number;
  totalAtraso: number;
  quantidadeAlunosAtivos: number;
  taxaInadimplencia: number;
  mensalidadesMes: Mensalidade[];
  totalAtrasados: number;
  totalPendentes: number;
  totalPagos: number;
}

export interface DashboardAlunoStats {
  mensalidadeAtual: Mensalidade | null;
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
  historico: Mensalidade[];
  proximoVencimento: Mensalidade | null;
}

export interface FiltrosMensalidade {
  status?: StatusMensalidade;
  mes?: number;
  ano?: number;
  alunoId?: string;
}

export interface Configuracoes {
  tema: 'light' | 'dark';
  notificacoesAtivas: boolean;
}

export interface CadastroAlunoDTO {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  endereco?: string;
  faculdade: string;
  curso: string;
  pontoEmbarque: string;
  turno: 'manha' | 'noite';
}

