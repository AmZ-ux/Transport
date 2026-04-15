import {
  Aluno,
  Mensalidade,
  Usuario,
  StatusMensalidade,
  DashboardStats,
  DashboardAlunoStats,
  FiltrosMensalidade,
  CadastroAlunoDTO,
  Notificacao,
  ComprovantePagamento,
} from '@/types';
import {
  gerarId,
  calcularStatus,
  gerarDataVencimento,
  formatarValor,
  formatarData,
} from '@/lib/utils';

// Chaves do localStorage
const KEYS = {
  ALUNOS: 'transporte_alunos',
  MENSALIDADES: 'transporte_mensalidades',
  USUARIOS: 'transporte_usuarios',
  USUARIO_LOGADO: 'transporte_usuario_logado',
  NOTIFICACOES: 'transporte_notificacoes',
  CONFIG: 'transporte_config',
} as const;

const ADMIN_EMAILS = ['admin@transporte.com', 'toinzim838@gmail.com'];

// ==================== ALUNOS ====================

export function getAlunos(): Aluno[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.ALUNOS);
  if (!data) return [];

  const alunos: Aluno[] = JSON.parse(data);
  // Vincular dados do usuário
  const usuarios = getUsuarios();
  return alunos.map(aluno => {
    const usuario = usuarios.find(u => u.id === aluno.usuarioId);
    return {
      ...aluno,
      nome: aluno.nome || usuario?.nome || '',
      usuario,
    };
  });
}

export function salvarAluno(aluno: Omit<Aluno, 'id' | 'dataCadastro'>): Aluno {
  const alunos = getAlunos();
  const novoAluno: Aluno = {
    ...aluno,
    usuarioId: aluno.usuarioId || gerarId(),
    id: gerarId(),
    dataCadastro: new Date().toISOString(),
  };
  alunos.push(novoAluno);
  localStorage.setItem(KEYS.ALUNOS, JSON.stringify(alunos));

  // Gerar mensalidade para o mes atual
  gerarMensalidadesParaAluno(novoAluno);

  return novoAluno;
}

// Cadastro publico de aluno (cria usuario + aluno)
export function cadastrarAlunoPublico(dados: CadastroAlunoDTO): { sucesso: boolean; mensagem: string; usuario?: Usuario } {
  // Verificar se email ja existe
  if (getUsuarioPorEmail(dados.email)) {
    return { sucesso: false, mensagem: 'Email ja cadastrado. Use outro email ou faca login.' };
  }

  // Criar usuario
  const usuario: Usuario = {
    id: gerarId(),
    nome: dados.nome,
    email: dados.email,
    senha: dados.senha, // Em producao: hash da senha
    tipo: 'aluno',
    dataCadastro: new Date().toISOString(),
    ativo: true,
  };
  salvarUsuario(usuario);

  // Criar aluno vinculado ao usuario
  const valorMensalidadePadrao = 150; // Valor padrao, admin pode alterar depois
  const diaVencimentoPadrao = 10; // Dia 10 padrao

  salvarAluno({
    nome: dados.nome,
    usuarioId: usuario.id,
    telefone: dados.telefone.replace(/\D/g, ''),
    endereco: dados.endereco,
    curso: dados.curso,
    faculdade: dados.faculdade,
    pontoEmbarque: dados.pontoEmbarque,
    turno: dados.turno,
    valorMensalidade: valorMensalidadePadrao,
    diaVencimento: diaVencimentoPadrao,
    ativo: true,
  });

  return { sucesso: true, mensagem: 'Cadastro realizado com sucesso!', usuario };
}

// Buscar aluno por ID do usuario
export function getAlunoPorUsuarioId(usuarioId: string): Aluno | null {
  const alunos = getAlunos();
  return alunos.find(a => a.usuarioId === usuarioId) || null;
}

export function atualizarAluno(aluno: Aluno): Aluno {
  const alunos = getAlunos();
  const index = alunos.findIndex(a => a.id === aluno.id);
  if (index >= 0) {
    alunos[index] = aluno;
    localStorage.setItem(KEYS.ALUNOS, JSON.stringify(alunos));
  }
  return aluno;
}

export function excluirAluno(id: string): void {
  const alunos = getAlunos();
  const alunoIndex = alunos.findIndex(a => a.id === id);
  if (alunoIndex >= 0) {
    // Marcar como inativo ao inves de excluir
    alunos[alunoIndex].ativo = false;
    localStorage.setItem(KEYS.ALUNOS, JSON.stringify(alunos));
  }
}

export function getAlunoPorId(id: string): Aluno | null {
  const alunos = getAlunos();
  return alunos.find(a => a.id === id) || null;
}

export function getAlunosAtivos(): Aluno[] {
  return getAlunos().filter(a => a.ativo !== false);
}

export function buscarAlunos(termo: string): Aluno[] {
  const alunos = getAlunosAtivos();
  const termoLower = termo.toLowerCase();
  return alunos.filter(a =>
    a.nome.toLowerCase().includes(termoLower) ||
    a.telefone.includes(termo) ||
    a.curso.toLowerCase().includes(termoLower) ||
    a.faculdade.toLowerCase().includes(termoLower)
  );
}

// ==================== MENSALIDADES ====================

export function getMensalidades(): Mensalidade[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.MENSALIDADES);
  const mensalidades: Mensalidade[] = data ? JSON.parse(data) : [];

  // Atualizar status dinamicamente
  return mensalidades.map(m => ({
    ...m,
    status: calcularStatus(m),
  }));
}

export function salvarMensalidade(mensalidade: Omit<Mensalidade, 'id'>): Mensalidade {
  const mensalidades = getMensalidades();
  const novaMensalidade: Mensalidade = {
    ...mensalidade,
    id: gerarId(),
  };
  mensalidades.push(novaMensalidade);
  localStorage.setItem(KEYS.MENSALIDADES, JSON.stringify(mensalidades));
  return novaMensalidade;
}

export function atualizarMensalidade(mensalidade: Mensalidade): Mensalidade {
  const mensalidades = getMensalidades();
  const index = mensalidades.findIndex(m => m.id === mensalidade.id);
  if (index >= 0) {
    mensalidades[index] = mensalidade;
    localStorage.setItem(KEYS.MENSALIDADES, JSON.stringify(mensalidades));
  }
  return mensalidade;
}

export function getMensalidadePorId(id: string): Mensalidade | null {
  const mensalidades = getMensalidades();
  const mensalidade = mensalidades.find(m => m.id === id);
  if (!mensalidade) return null;

  const aluno = getAlunos().find(a => a.id === mensalidade.alunoId);
  return {
    ...mensalidade,
    aluno,
  };
}

export function filtrarMensalidades(filtros: FiltrosMensalidade): Mensalidade[] {
  let mensalidades = getMensalidades();

  if (filtros.status) {
    mensalidades = mensalidades.filter(m => m.status === filtros.status);
  }

  if (filtros.mes !== undefined) {
    mensalidades = mensalidades.filter(m => m.mesReferencia === filtros.mes);
  }

  if (filtros.ano !== undefined) {
    mensalidades = mensalidades.filter(m => m.anoReferencia === filtros.ano);
  }

  if (filtros.alunoId) {
    mensalidades = mensalidades.filter(m => m.alunoId === filtros.alunoId);
  }

  return mensalidades;
}

// Gerar mensalidades automaticamente para um aluno
export function gerarMensalidadesParaAluno(aluno: Aluno): void {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  // Verificar se ja existe mensalidade para este mes
  const mensalidades = getMensalidades();
  const existe = mensalidades.some(
    m => m.alunoId === aluno.id && m.mesReferencia === mesAtual && m.anoReferencia === anoAtual
  );

  if (!existe) {
    salvarMensalidade({
      alunoId: aluno.id,
      mesReferencia: mesAtual,
      anoReferencia: anoAtual,
      valor: aluno.valorMensalidade,
      dataVencimento: gerarDataVencimento(aluno.diaVencimento, mesAtual, anoAtual),
      status: 'pendente',
    });
  }
}

// Gerar mensalidades para todos os alunos (chamado no inicio do mes)
export function gerarMensalidadesMes(): void {
  const alunos = getAlunosAtivos();

  alunos.forEach(aluno => {
    gerarMensalidadesParaAluno(aluno);
  });
}

// Registrar pagamento
export function registrarPagamento(
  mensalidadeId: string,
  formaPagamento: string,
  dataPagamento: string = new Date().toISOString().split('T')[0],
  observacoes?: string
): Mensalidade | null {
  const mensalidade = getMensalidadePorId(mensalidadeId);
  if (!mensalidade) return null;

  const atualizada: Mensalidade = {
    ...mensalidade,
    dataPagamento,
    formaPagamento: formaPagamento as Mensalidade['formaPagamento'],
    observacoes,
    status: 'pago',
  };

  atualizarMensalidade(atualizada);
  return atualizada;
}

// ==================== DASHBOARD ====================

export function getDashboardStats(): DashboardStats {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const alunosAtivos = getAlunosAtivos();
  const mensalidades = getMensalidades();
  const mensalidadesMes = mensalidades.filter(
    m => m.mesReferencia === mesAtual && m.anoReferencia === anoAtual
  );

  const totalReceberMes = mensalidadesMes.reduce((acc, m) => acc + m.valor, 0);
  const totalRecebido = mensalidadesMes
    .filter(m => m.status === 'pago')
    .reduce((acc, m) => acc + m.valor, 0);
  const totalAtraso = mensalidadesMes
    .filter(m => m.status === 'atrasado')
    .reduce((acc, m) => acc + m.valor, 0);

  const totalAtrasados = mensalidadesMes.filter(m => m.status === 'atrasado').length;
  const totalPendentes = mensalidadesMes.filter(m => m.status === 'pendente').length;
  const totalPagos = mensalidadesMes.filter(m => m.status === 'pago').length;

  // Taxa de inadimplencia = (atrasados + pendentes) / total * 100
  const taxaInadimplencia = totalReceberMes > 0
    ? ((totalAtraso + (totalPendentes > 0 ? mensalidadesMes.filter(m => m.status === 'pendente').reduce((acc, m) => acc + m.valor, 0) : 0)) / totalReceberMes) * 100
    : 0;

  return {
    totalReceberMes,
    totalRecebido,
    totalAtraso,
    quantidadeAlunosAtivos: alunosAtivos.length,
    taxaInadimplencia: Math.round(taxaInadimplencia * 100) / 100,
    mensalidadesMes: mensalidadesMes.sort((a, b) => {
      // Ordenar: atrasados primeiro, depois pendentes, depois pagos
      const prioridade = { atrasado: 0, pendente: 1, pago: 2 };
      return prioridade[a.status] - prioridade[b.status];
    }),
    totalAtrasados,
    totalPendentes,
    totalPagos,
  };
}

// Dashboard do Aluno
export function getDashboardAlunoStats(usuarioId: string): DashboardAlunoStats {
  const aluno = getAlunoPorUsuarioId(usuarioId);
  if (!aluno) {
    return {
      mensalidadeAtual: null,
      totalPago: 0,
      totalPendente: 0,
      totalAtrasado: 0,
      historico: [],
      proximoVencimento: null,
    };
  }

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const mensalidades = getMensalidades().filter(m => m.alunoId === aluno.id);

  const mensalidadeAtual = mensalidades.find(
    m => m.mesReferencia === mesAtual && m.anoReferencia === anoAtual
  ) || null;

  const totalPago = mensalidades
    .filter(m => m.status === 'pago')
    .reduce((acc, m) => acc + m.valor, 0);

  const totalPendente = mensalidades
    .filter(m => m.status === 'pendente')
    .reduce((acc, m) => acc + m.valor, 0);

  const totalAtrasado = mensalidades
    .filter(m => m.status === 'atrasado')
    .reduce((acc, m) => acc + m.valor, 0);

  // Proximo vencimento (pendente ou atrasado mais proximo)
  const proximoVencimento = mensalidades
    .filter(m => m.status !== 'pago')
    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())[0] || null;

  return {
    mensalidadeAtual,
    totalPago,
    totalPendente,
    totalAtrasado,
    historico: mensalidades.sort((a, b) => {
      // Ordenar do mais recente para o mais antigo
      if (b.anoReferencia !== a.anoReferencia) {
        return b.anoReferencia - a.anoReferencia;
      }
      return b.mesReferencia - a.mesReferencia;
    }),
    proximoVencimento,
  };
}

// ==================== AUTH ====================

export function login(email: string, senha: string): { sucesso: boolean; usuario?: Usuario } {
  // Login simples - em producao usar hash
  const usuario = getUsuarioPorEmail(email);
  if (usuario && usuario.senha === senha && usuario.ativo) {
    localStorage.setItem(KEYS.USUARIO_LOGADO, JSON.stringify(usuario));
    return { sucesso: true, usuario };
  }
  return { sucesso: false };
}

export function logout(): void {
  localStorage.removeItem(KEYS.USUARIO_LOGADO);
}

export function getUsuarioLogado(): Usuario | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.USUARIO_LOGADO);
  if (!data) return null;

  const usuarioSessao: Usuario = JSON.parse(data);
  const usuarioAtual = getUsuarios().find(u => u.id === usuarioSessao.id) || usuarioSessao;

  if (usuarioAtual.tipo !== usuarioSessao.tipo) {
    localStorage.setItem(KEYS.USUARIO_LOGADO, JSON.stringify(usuarioAtual));
  }

  return usuarioAtual;
}

export function estaAutenticado(): boolean {
  return !!getUsuarioLogado();
}

export function isAdmin(): boolean {
  const usuario = getUsuarioLogado();
  return usuario?.tipo === 'admin';
}

export function isAluno(): boolean {
  const usuario = getUsuarioLogado();
  return usuario?.tipo === 'aluno';
}

// Usuario padrao (para primeiro acesso)
export function criarUsuarioPadrao(): void {
  const usuarios = getUsuarios();
  const adminPadraoEmail = 'admin@transporte.com';
  const adminPadrao = usuarios.find(u => u.email === adminPadraoEmail);

  if (!adminPadrao) {
    salvarUsuario({
      id: gerarId(),
      nome: 'Administrador',
      email: adminPadraoEmail,
      senha: 'admin123',
      tipo: 'admin',
      dataCadastro: new Date().toISOString(),
      ativo: true,
    });
    return;
  }

  if (adminPadrao.tipo !== 'admin') {
    salvarUsuario({ ...adminPadrao, tipo: 'admin' });
  }
}

function garantirAdminsPorEmail(): void {
  const usuarios = getUsuarios();
  let houveAtualizacao = false;

  const atualizados = usuarios.map(usuario => {
    if (ADMIN_EMAILS.includes(usuario.email.toLowerCase()) && usuario.tipo !== 'admin') {
      houveAtualizacao = true;
      return { ...usuario, tipo: 'admin' as const };
    }
    return usuario;
  });

  if (houveAtualizacao) {
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(atualizados));
  }
}

export function getUsuarios(): Usuario[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.USUARIOS);
  return data ? JSON.parse(data) : [];
}

export function salvarUsuario(usuario: Usuario): void {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex(u => u.id === usuario.id);
  if (index >= 0) {
    usuarios[index] = usuario;
  } else {
    usuarios.push(usuario);
  }
  localStorage.setItem(KEYS.USUARIOS, JSON.stringify(usuarios));
}

export function getUsuarioPorEmail(email: string): Usuario | null {
  const usuarios = getUsuarios();
  return usuarios.find(u => u.email === email) || null;
}

export function getUsuarioPorId(id: string): Usuario | null {
  const usuarios = getUsuarios();
  return usuarios.find(u => u.id === id) || null;
}

// ==================== INICIALIZACAO ====================

export function inicializarDados(): void {
  if (typeof window === 'undefined') return;
  criarUsuarioPadrao();
  garantirAdminsPorEmail();
  gerarMensalidadesMes();
}

// ==================== EXPORTACAO ====================

export function exportarDados() {
  return {
    alunos: getAlunos(),
    mensalidades: getMensalidades(),
    dataExportacao: new Date().toISOString(),
  };
}

export function importarDados(dados: { alunos: Aluno[], mensalidades: Mensalidade[] }): void {
  localStorage.setItem(KEYS.ALUNOS, JSON.stringify(dados.alunos));
  localStorage.setItem(KEYS.MENSALIDADES, JSON.stringify(dados.mensalidades));
}

// Limpar todos os dados (usar com cuidado!)
export function limparDados(): void {
  localStorage.removeItem(KEYS.ALUNOS);
  localStorage.removeItem(KEYS.MENSALIDADES);
  localStorage.removeItem(KEYS.USUARIO_LOGADO);
  localStorage.removeItem(KEYS.USUARIOS);
  localStorage.removeItem(KEYS.NOTIFICACOES);
}

// ==================== COMPROVANTES ====================

export function enviarComprovante(
  mensalidadeId: string,
  arquivoBase64: string,
  nomeArquivo: string,
  tipoArquivo: string,
  observacao?: string
): boolean {
  const mensalidade = getMensalidadePorId(mensalidadeId);
  if (!mensalidade) return false;

  const comprovante: ComprovantePagamento = {
    id: gerarId(),
    arquivoBase64,
    nomeArquivo,
    tipoArquivo,
    dataEnvio: new Date().toISOString(),
    observacao,
  };

  const atualizada: Mensalidade = {
    ...mensalidade,
    comprovante,
    observacoes: observacao,
  };

  atualizarMensalidade(atualizada);
  return true;
}

// ==================== NOTIFICACOES ====================

export function getNotificacoes(usuarioId: string): Notificacao[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.NOTIFICACOES);
  if (!data) return [];

  const notificacoes: Notificacao[] = JSON.parse(data);
  return notificacoes.filter(n => n.alunoId === usuarioId).sort((a, b) =>
    new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime()
  );
}

export function criarNotificacao(notificacao: Omit<Notificacao, 'id' | 'dataEnvio' | 'lida'>): Notificacao {
  const notificacoes = getTodasNotificacoes();
  const nova: Notificacao = {
    ...notificacao,
    id: gerarId(),
    dataEnvio: new Date().toISOString(),
    lida: false,
  };
  notificacoes.push(nova);
  localStorage.setItem(KEYS.NOTIFICACOES, JSON.stringify(notificacoes));
  return nova;
}

export function marcarNotificacaoComoLida(notificacaoId: string): void {
  const notificacoes = getTodasNotificacoes();
  const index = notificacoes.findIndex(n => n.id === notificacaoId);
  if (index >= 0) {
    notificacoes[index].lida = true;
    localStorage.setItem(KEYS.NOTIFICACOES, JSON.stringify(notificacoes));
  }
}

export function getNotificacoesNaoLidas(usuarioId: string): Notificacao[] {
  return getNotificacoes(usuarioId).filter(n => !n.lida);
}

function getTodasNotificacoes(): Notificacao[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.NOTIFICACOES);
  return data ? JSON.parse(data) : [];
}

// Gerar notificacoes automaticas
export function gerarNotificacoesAutomaticas(): void {
  const hoje = new Date();
  const alunos = getAlunosAtivos();

  alunos.forEach(aluno => {
    const mensalidades = getMensalidades().filter(m => m.alunoId === aluno.id);

    mensalidades.forEach(m => {
      const vencimento = new Date(m.dataVencimento);
      const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      // 3 dias antes do vencimento
      if (diffDias === 3 && m.status === 'pendente') {
        criarNotificacao({
          alunoId: aluno.usuarioId,
          mensalidadeId: m.id,
          tipo: 'lembrete',
          titulo: 'Lembrete de Pagamento',
          mensagem: `Sua mensalidade vence em 3 dias (${formatarData(m.dataVencimento)}). Valor: ${formatarValor(m.valor)}`,
          link: '/minhas-mensalidades',
        });
      }

      // No dia do vencimento
      if (diffDias === 0 && m.status === 'pendente') {
        criarNotificacao({
          alunoId: aluno.usuarioId,
          mensalidadeId: m.id,
          tipo: 'vencimento',
          titulo: 'Vencimento Hoje',
          mensagem: `Sua mensalidade vence hoje! Valor: ${formatarValor(m.valor)}. Nao esqueca de pagar.`,
          link: '/minhas-mensalidades',
        });
      }

      // Apos atraso
      if (diffDias < 0 && m.status === 'atrasado' && diffDias >= -7) {
        // Verificar se ja existe notificacao de atraso recente
        const notificacoesExistentes = getNotificacoes(aluno.usuarioId);
        const jaNotificado = notificacoesExistentes.some(
          n => n.mensalidadeId === m.id && n.tipo === 'atraso' &&
          new Date(n.dataEnvio).getTime() > new Date().getTime() - 2 * 24 * 60 * 60 * 1000 // 2 dias
        );

        if (!jaNotificado) {
          criarNotificacao({
            alunoId: aluno.usuarioId,
            mensalidadeId: m.id,
            tipo: 'atraso',
            titulo: 'Mensalidade em Atraso',
            mensagem: `Sua mensalidade esta atrasada ${Math.abs(diffDias)} dias. Valor: ${formatarValor(m.valor)}. Regularize o quanto antes.`,
            link: '/minhas-mensalidades',
          });
        }
      }
    });
  });
}
