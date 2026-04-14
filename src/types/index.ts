// Tipos de usuário
export type TipoUsuario = 'admin' | 'aluno';

// Tipos de status de mensalidade
export type StatusMensalidade = 'pago' | 'pendente' | 'atrasado';

// Interface do Usuario
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  dataCadastro: string;
  ativo: boolean;
}

// Interface do Aluno (agora vinculado a um usuário)
export interface Aluno {
  id: string;
  usuarioId: string;
  usuario?: Usuario;
  telefone: string;
  endereco?: string;
  curso: string;
  faculdade: string;
  pontoEmbarque: string;
  turno: 'manha' | 'noite';
  valorMensalidade: number;
  diaVencimento: number;
  ativo: boolean;
  dataCadastro: string;
}

// Interface da Mensalidade
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
  // Novo: comprovante enviado pelo aluno
  comprovante?: ComprovantePagamento;
}

// Comprovante de pagamento enviado pelo aluno
export interface ComprovantePagamento {
  id: string;
  arquivoBase64: string;
  nomeArquivo: string;
  tipoArquivo: string;
  dataEnvio: string;
  observacao?: string;
}

// Formas de pagamento
export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao' | 'transferencia';

// Notificacao
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

// Dashboard stats do Admin
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

// Dashboard stats do Aluno
export interface DashboardAlunoStats {
  mensalidadeAtual: Mensalidade | null;
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
  historico: Mensalidade[];
  proximoVencimento: Mensalidade | null;
}

// Filtros de mensalidades
export interface FiltrosMensalidade {
  status?: StatusMensalidade;
  mes?: number;
  ano?: number;
  alunoId?: string;
}

// Configuracoes do app
export interface Configuracoes {
  tema: 'light' | 'dark';
  notificacoesAtivas: boolean;
}

// Dados de cadastro do aluno (formulario publico)
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
