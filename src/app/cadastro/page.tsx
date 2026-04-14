'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bus, UserPlus, CheckCircle } from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { useAuth } from '@/hooks/useAuth';

export default function CadastroPage() {
  const router = useRouter();
  const { cadastrar } = useAuth();

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

  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numeros.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const validar = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!form.nome.trim() || form.nome.length < 3) {
      novosErros.nome = 'Nome completo é obrigatório (mínimo 3 caracteres)';
    }

    if (!form.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      novosErros.email = 'Email inválido';
    }

    if (!form.senha || form.senha.length < 6) {
      novosErros.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (form.senha !== form.confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não conferem';
    }

    const telefoneNumeros = form.telefone.replace(/\D/g, '');
    if (telefoneNumeros.length < 10) {
      novosErros.telefone = 'Telefone inválido';
    }

    if (!form.faculdade.trim()) {
      novosErros.faculdade = 'Faculdade é obrigatória';
    }

    if (!form.curso.trim()) {
      novosErros.curso = 'Curso é obrigatório';
    }

    if (!form.pontoEmbarque.trim()) {
      novosErros.pontoEmbarque = 'Ponto de embarque é obrigatório';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) return;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'telefone' ? formatarTelefone(value) : value,
    }));
    // Limpar erro do campo
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Cadastro Realizado!
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Seu cadastro foi realizado com sucesso. Agora você pode acessar o sistema e acompanhar suas mensalidades.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Próximo passo:</strong> O administrador irá configurar o valor da sua mensalidade.
              </p>
            </div>

            <Button onClick={() => router.push('/login')} className="w-full">
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
          {/* Header */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Bus className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-gray-500">Transporte Universitário</span>
            </div>

            <div className="flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cadastro de Aluno</h1>
                <p className="text-gray-600 dark:text-gray-400">Preencha seus dados para se cadastrar no sistema</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {erros.geral && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {erros.geral}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full text-sm flex items-center justify-center">1</span>
                  Dados Pessoais
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome Completo"
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      error={erros.nome}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      error={erros.email}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <Input
                      label="Telefone (WhatsApp)"
                      name="telefone"
                      value={form.telefone}
                      onChange={handleChange}
                      error={erros.telefone}
                      required
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Endereço (opcional)"
                      name="endereco"
                      value={form.endereco}
                      onChange={handleChange}
                      placeholder="Rua, número, bairro"
                    />
                  </div>
                </div>
              </div>

              {/* Dados da Faculdade */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full text-sm flex items-center justify-center">2</span>
                  Dados da Faculdade
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Faculdade"
                      name="faculdade"
                      value={form.faculdade}
                      onChange={handleChange}
                      error={erros.faculdade}
                      required
                      placeholder="Ex: UFBA, UNEB"
                    />
                  </div>

                  <div>
                    <Input
                      label="Curso"
                      name="curso"
                      value={form.curso}
                      onChange={handleChange}
                      error={erros.curso}
                      required
                      placeholder="Ex: Medicina, Direito"
                    />
                  </div>

                  <div>
                    <Input
                      label="Ponto de Embarque"
                      name="pontoEmbarque"
                      value={form.pontoEmbarque}
                      onChange={handleChange}
                      error={erros.pontoEmbarque}
                      required
                      placeholder="Ex: Ponto do Shopping"
                    />
                  </div>

                  <div>
                    <Select
                      label="Turno"
                      name="turno"
                      value={form.turno}
                      onChange={handleChange}
                      required
                    >
                      <option value="manha">Manhã</option>
                      <option value="noite">Noite</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Senha */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full text-sm flex items-center justify-center">3</span>
                  Criar Senha
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Senha"
                      name="senha"
                      type="password"
                      value={form.senha}
                      onChange={handleChange}
                      error={erros.senha}
                      required
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <Input
                      label="Confirmar Senha"
                      name="confirmarSenha"
                      type="password"
                      value={form.confirmarSenha}
                      onChange={handleChange}
                      error={erros.confirmarSenha}
                      required
                      placeholder="Digite a senha novamente"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link
                  href="/login"
                  className="px-6 py-3 text-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Já tenho conta - Fazer login
                </Link>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={carregando}
                  className="flex-1"
                >
                  Criar Conta
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
