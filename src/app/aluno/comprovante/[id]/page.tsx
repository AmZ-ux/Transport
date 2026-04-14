'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, ArrowLeft, FileText, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { AlunoLayout, ProtectedRoute, Card, CardHeader, CardBody, Button, Input, Loading } from '@/components';
import { getMensalidadePorId, enviarComprovante } from '@/services/storage';
import { Mensalidade } from '@/types';
import { formatarValor, formatarData } from '@/lib/utils';

export default function EnviarComprovantePage() {
  const router = useRouter();
  const params = useParams();
  const mensalidadeId = params.id as string;

  const [mensalidade, setMensalidade] = useState<Mensalidade | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const m = getMensalidadePorId(mensalidadeId);
    setMensalidade(m);
    setCarregando(false);
  }, [mensalidadeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo e tamanho
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      setErro('Tipo de arquivo não suportado. Use JPG, PNG ou PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErro('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setErro('');
    setArquivo(file);

    // Criar preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!arquivo) {
      setErro('Selecione um arquivo para enviar.');
      return;
    }

    setEnviando(true);
    setErro('');

    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;

        const sucesso = enviarComprovante(
          mensalidadeId,
          base64,
          arquivo.name,
          arquivo.type,
          observacao
        );

        if (sucesso) {
          setSucesso(true);
        } else {
          setErro('Erro ao enviar comprovante. Tente novamente.');
        }
        setEnviando(false);
      };
      reader.readAsDataURL(arquivo);
    } catch {
      setErro('Erro ao processar arquivo. Tente novamente.');
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <ProtectedRoute>
        <AlunoLayout>
          <Loading />
        </AlunoLayout>
      </ProtectedRoute>
    );
  }

  if (!mensalidade) {
    return (
      <ProtectedRoute>
        <AlunoLayout>
          <div className="max-w-lg mx-auto text-center py-12">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mensalidade não encontrada</h1>
            <p className="text-gray-500 mb-4">A mensalidade que você está procurando não existe.</p>
            <Button onClick={() => router.push('/aluno/minhas-mensalidades')}>Voltar</Button>
          </div>
        </AlunoLayout>
      </ProtectedRoute>
    );
  }

  if (sucesso) {
    return (
      <ProtectedRoute>
        <AlunoLayout>
          <div className="max-w-lg mx-auto">
            <Button variant="ghost" onClick={() => router.push('/aluno/minhas-mensalidades')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <Card className="text-center">
              <CardBody className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Comprovante Enviado!</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Seu comprovante foi enviado com sucesso. O administrador irá revisar e confirmar o pagamento em breve.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Mensalidade:</strong> {mensalidade.mesReferencia}/{mensalidade.anoReferencia}<br />
                    <strong>Valor:</strong> {formatarValor(mensalidade.valor)}
                  </p>
                </div>

                <Button onClick={() => router.push('/aluno/minhas-mensalidades')} className="w-full">
                  Ver Minhas Mensalidades
                </Button>
              </CardBody>
            </Card>
          </div>
        </AlunoLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute tipoRequerido="aluno">
      <AlunoLayout>
        <div className="max-w-xl mx-auto">
          <Button variant="ghost" onClick={() => router.push('/aluno/minhas-mensalidades')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-6 w-6 text-primary-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Enviar Comprovante</h1>
                  <p className="text-sm text-gray-500">Envie o comprovante do pagamento</p>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {/* Resumo da Mensalidade */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Mensalidade</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Mês/Ano</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {mensalidade.mesReferencia}/{mensalidade.anoReferencia}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatarValor(mensalidade.valor)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vencimento</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatarData(mensalidade.dataVencimento)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium capitalize">{mensalidade.status}</p>
                  </div>
                </div>
              </div>

              {erro && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">{erro}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload de Arquivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comprovante (imagem ou PDF) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="comprovante"
                      required
                    />
                    <label htmlFor="comprovante" className="cursor-pointer">
                      {preview ? (
                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                      ) : arquivo ? (
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <FileText className="h-8 w-8" />
                          <span>{arquivo.name}</span>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                          <p className="font-medium">Clique para selecionar o comprovante</p>
                          <p className="text-sm">JPG, PNG ou PDF (máx. 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Observação */}
                <div>
                  <Input
                    label="Observação (opcional)"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Ex: Paguei via PIX no dia X"
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => router.push('/aluno/minhas-mensalidades')}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" loading={enviando} className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Comprovante
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </AlunoLayout>
    </ProtectedRoute>
  );
}
