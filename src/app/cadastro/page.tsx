'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bus, CheckCircle, UserPlus } from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { formatarTelefoneInput } from '@/utils';

const TOTAL_STEPS = 3;

export default function CadastroPage() {
  const router = useRouter();
  const { cadastrar } = useAuth();

  const [step, setStep] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    endereco: '',
    faculdade: '',
    curso: '',
    pontoEmbarque: '',
    turno: 'manha' as 'manha' | 'noite',
  });

  const tituloEtapa = useMemo(() => {
    if (step === 0) return 'Dados pessoais';
    if (step === 1) return 'Dados academicos';
    return 'Criar acesso';
  }, [step]);

  const validarEtapa = (current: number) => {
    const nextErrors: Record<string, string> = {};

    if (current === 0) {
      if (!form.nome.trim() || form.nome.trim().length < 3) {
        nextErrors.nome = 'Informe o nome completo';
      }

      const telefoneNumeros = form.telefone.replace(/\D/g, '');
      if (telefoneNumeros.length < 10) {
        nextErrors.telefone = 'Telefone invalido';
      }
    }

    if (current === 1) {
      if (!form.faculdade.trim()) nextErrors.faculdade = 'Faculdade obrigatoria';
      if (!form.curso.trim()) nextErrors.curso = 'Curso obrigatorio';
      if (!form.pontoEmbarque.trim()) nextErrors.pontoEmbarque = 'Ponto de embarque obrigatorio';
    }

    if (current === 2) {
      if (!form.email.trim()) {
        nextErrors.email = 'Email obrigatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        nextErrors.email = 'Email invalido';
      }

      if (form.senha.length < 6) {
        nextErrors.senha = 'Minimo de 6 caracteres';
      }

      if (form.senha !== form.confirmarSenha) {
        nextErrors.confirmarSenha = 'As senhas nao conferem';
      }
    }

    setErros(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'telefone' ? formatarTelefoneInput(value) : value,
    }));

    if (erros[name]) {
      setErros((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const avancar = () => {
    if (!validarEtapa(step)) return;
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  };

  const voltar = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarEtapa(step)) return;

    setCarregando(true);
    const resultado = cadastrar({
      nome: form.nome,
      email: form.email,
      senha: form.senha,
      telefone: form.telefone.replace(/\D/g, ''),
      endereco: form.endereco,
      faculdade: form.faculdade,
      curso: form.curso,
      pontoEmbarque: form.pontoEmbarque,
      turno: form.turno,
    });

    if (resultado.sucesso) {
      setSucesso(true);
    } else {
      setErros({ geral: resultado.mensagem });
    }

    setCarregando(false);
  };

  if (sucesso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm dark:border-emerald-900 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cadastro realizado</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Sua conta foi criada com sucesso. Agora voce pode fazer login e acompanhar suas mensalidades.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push('/login')}>
            Ir para login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <header className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Bus className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium">Transporte Universitario</span>
          </div>
          <div className="flex items-center gap-3">
            <UserPlus className="h-7 w-7 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cadastro de aluno</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Fluxo simples e rapido em 3 etapas.</p>
            </div>
          </div>
        </header>

        <div className="p-5 sm:p-6">
          <div className="mb-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Etapa {step + 1} de {TOTAL_STEPS}</span>
              <span>{tituloEtapa}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-colors ${i <= step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                />
              ))}
            </div>
          </div>

          {erros.geral && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{erros.geral}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 0 && (
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Nome completo"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  error={erros.nome}
                  required
                />
                <Input
                  label="Telefone"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  error={erros.telefone}
                  placeholder="(00) 00000-0000"
                  required
                />
                <Input
                  label="Endereco (opcional)"
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  placeholder="Rua, numero, bairro"
                />
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Faculdade"
                  name="faculdade"
                  value={form.faculdade}
                  onChange={handleChange}
                  error={erros.faculdade}
                  required
                />
                <Input
                  label="Curso"
                  name="curso"
                  value={form.curso}
                  onChange={handleChange}
                  error={erros.curso}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Ponto de embarque"
                    name="pontoEmbarque"
                    value={form.pontoEmbarque}
                    onChange={handleChange}
                    error={erros.pontoEmbarque}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Select label="Turno" name="turno" value={form.turno} onChange={handleChange} required>
                    <option value="manha">Manha</option>
                    <option value="noite">Noite</option>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={erros.email}
                    required
                  />
                </div>
                <Input
                  label="Senha"
                  name="senha"
                  type="password"
                  value={form.senha}
                  onChange={handleChange}
                  error={erros.senha}
                  required
                />
                <Input
                  label="Confirmar senha"
                  name="confirmarSenha"
                  type="password"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  error={erros.confirmarSenha}
                  required
                />
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
                Ja tenho conta
              </Link>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={voltar} disabled={step === 0 || carregando}>
                  Voltar
                </Button>
                {step < TOTAL_STEPS - 1 ? (
                  <Button type="button" onClick={avancar}>
                    Proxima etapa
                  </Button>
                ) : (
                  <Button type="submit" loading={carregando}>
                    Criar conta
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

