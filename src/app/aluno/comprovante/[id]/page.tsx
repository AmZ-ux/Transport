'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
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

  const voltar = () => router.push('/aluno/minhas-mensalidades');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      setErro('Tipo de arquivo nao suportado. Use JPG, PNG ou PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErro('Arquivo muito grande. Maximo 5MB.');
      return;
    }

    setErro('');
    setArquivo(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!arquivo) {
      setErro('Selecione um arquivo para enviar.');
      return;
    }

    setEnviando(true);
    setErro('');

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const envioOk = enviarComprovante(mensalidadeId, base64, arquivo.name, arquivo.type, observacao);

        if (envioOk) {
          setSucesso(true);
        } else {
          setErro('Erro ao enviar comprovante. Tente novamente.');
        }
        setEnviando(false);
      };
      reader.readAsDataURL(arquivo);
    } catch {
      setErro('Erro ao processar o arquivo. Tente novamente.');
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <ProtectedRoute tipoRequerido="aluno">
        <AlunoLayout>
          <Loading />
        </AlunoLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute tipoRequerido="aluno">
      <AlunoLayout>
        <div className="mx-auto w-full max-w-xl space-y-4">
          <header className="flex items-center gap-3">
            <button
              onClick={voltar}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="cardTitle text-gray-900 dark:text-white">Enviar comprovante</h1>
              <p className="pageSubtitle text-gray-600 dark:text-gray-400">Envie o comprovante do pagamento.</p>
            </div>
          </header>

          {!mensalidade ? (
            <Card className="border-gray-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.10)]">
              <CardBody className="space-y-4 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mensalidade nao encontrada</h2>
                <p className="text-gray-500">A mensalidade informada nao existe ou foi removida.</p>
                <Button onClick={voltar}>Voltar</Button>
              </CardBody>
            </Card>
          ) : sucesso ? (
            <Card className="border-gray-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.10)]">
              <CardBody className="space-y-5 p-6 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Comprovante enviado</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    O administrador vai revisar e confirmar o pagamento em breve.
                  </p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-left text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                  <p><strong>Mensalidade:</strong> {mensalidade.mesReferencia}/{mensalidade.anoReferencia}</p>
                  <p><strong>Valor:</strong> {formatarValor(mensalidade.valor)}</p>
                </div>
                <Button className="w-full" onClick={voltar}>
                  Ver minhas mensalidades
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-gray-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.10)]">
              <CardHeader>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dados da mensalidade</h2>
              </CardHeader>

              <CardBody className="space-y-6">
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Mes/Ano</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {mensalidade.mesReferencia}/{mensalidade.anoReferencia}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valor</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatarValor(mensalidade.valor)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vencimento</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatarData(mensalidade.dataVencimento)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="font-semibold capitalize text-gray-900 dark:text-white">{mensalidade.status}</p>
                    </div>
                  </div>
                </div>

                {erro && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                    {erro}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Comprovante (imagem ou PDF) *
                    </label>
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-primary-500 dark:border-gray-700">
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
                          <img src={preview} alt="Preview do comprovante" className="mx-auto max-h-48 rounded-lg" />
                        ) : arquivo ? (
                          <div className="flex items-center justify-center gap-2 text-gray-600">
                            <FileText className="h-8 w-8" />
                            <span className="break-all">{arquivo.name}</span>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <ImageIcon className="mx-auto mb-2 h-12 w-12" />
                            <p className="font-medium">Clique para selecionar o comprovante</p>
                            <p className="text-sm">JPG, PNG ou PDF (max. 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <Input
                    label="Observacao (opcional)"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Ex: Paguei via PIX no dia X"
                  />

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={voltar}>
                      Cancelar
                    </Button>
                    <Button type="submit" loading={enviando} className="flex-1">
                      <Upload className="h-4 w-4" />
                      Enviar comprovante
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}
        </div>
      </AlunoLayout>
    </ProtectedRoute>
  );
}
