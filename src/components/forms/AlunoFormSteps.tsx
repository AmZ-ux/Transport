'use client';

import { useMemo, useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { validarTelefone } from '@/lib/utils';
import { formatarTelefoneInput } from '@/utils';

export interface AlunoFormValues {
  nome: string;
  telefone: string;
  endereco: string;
  curso: string;
  faculdade: string;
  pontoEmbarque: string;
  valorMensalidade: string;
  diaVencimento: string;
  ativo: boolean;
}

interface AlunoFormStepsProps {
  initialValues?: Partial<AlunoFormValues>;
  onSubmit: (values: AlunoFormValues) => Promise<void> | void;
  loading?: boolean;
  submitLabel?: string;
  showStatusField?: boolean;
}

const defaultValues: AlunoFormValues = {
  nome: '',
  telefone: '',
  endereco: '',
  curso: '',
  faculdade: '',
  pontoEmbarque: '',
  valorMensalidade: '',
  diaVencimento: '5',
  ativo: true,
};

export function AlunoFormSteps({
  initialValues,
  onSubmit,
  loading = false,
  submitLabel = 'Salvar aluno',
  showStatusField = false,
}: AlunoFormStepsProps) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<AlunoFormValues>({ ...defaultValues, ...initialValues });

  const steps = useMemo(
    () => [
      { id: 'dados', title: 'Dados pessoais' },
      { id: 'academico', title: 'Dados academicos' },
      { id: 'financeiro', title: 'Financeiro' },
    ],
    []
  );

  const validateStep = (current: number) => {
    const nextErrors: Record<string, string> = {};

    if (current === 0) {
      if (!form.nome.trim()) nextErrors.nome = 'Nome obrigatorio';
      if (!form.telefone.trim()) nextErrors.telefone = 'Telefone obrigatorio';
      if (form.telefone && !validarTelefone(form.telefone)) nextErrors.telefone = 'Telefone invalido';
    }

    if (current === 1) {
      if (!form.curso.trim()) nextErrors.curso = 'Curso obrigatorio';
      if (!form.faculdade.trim()) nextErrors.faculdade = 'Faculdade obrigatoria';
      if (!form.pontoEmbarque.trim()) nextErrors.pontoEmbarque = 'Ponto obrigatorio';
    }

    if (current === 2) {
      if (!form.valorMensalidade || Number(form.valorMensalidade) <= 0) {
        nextErrors.valorMensalidade = 'Valor invalido';
      }
      if (!form.diaVencimento) nextErrors.diaVencimento = 'Dia obrigatorio';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (name: keyof AlunoFormValues, value: string | boolean) => {
    const normalized = name === 'telefone' && typeof value === 'string' ? formatarTelefoneInput(value) : value;
    setForm((prev) => ({ ...prev, [name]: normalized }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>Etapa {step + 1} de {steps.length}</span>
          <span>{steps[step].title}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {steps.map((item, index) => (
            <div
              key={item.id}
              className={`h-2 rounded-full transition-colors ${index <= step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-800'}`}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Nome completo"
            value={form.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            error={errors.nome}
            required
          />
          <Input
            label="Telefone (WhatsApp)"
            value={form.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
            error={errors.telefone}
            placeholder="(00) 00000-0000"
            required
          />
          <Input
            label="Endereco (opcional)"
            value={form.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            placeholder="Rua, numero, bairro"
          />
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Curso"
            value={form.curso}
            onChange={(e) => handleChange('curso', e.target.value)}
            error={errors.curso}
            required
          />
          <Input
            label="Faculdade"
            value={form.faculdade}
            onChange={(e) => handleChange('faculdade', e.target.value)}
            error={errors.faculdade}
            required
          />
          <div className="sm:col-span-2">
            <Input
              label="Ponto de embarque"
              value={form.pontoEmbarque}
              onChange={(e) => handleChange('pontoEmbarque', e.target.value)}
              error={errors.pontoEmbarque}
              required
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Valor da mensalidade"
            type="number"
            min="0"
            step="0.01"
            value={form.valorMensalidade}
            onChange={(e) => handleChange('valorMensalidade', e.target.value)}
            error={errors.valorMensalidade}
            required
          />
          <Select
            label="Dia de vencimento"
            value={form.diaVencimento}
            onChange={(e) => handleChange('diaVencimento', e.target.value)}
            error={errors.diaVencimento}
            required
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((dia) => (
              <option key={dia} value={dia}>
                Dia {dia}
              </option>
            ))}
          </Select>

          {showStatusField && (
            <div className="sm:col-span-2">
              <Select
                label="Status do cadastro"
                value={String(form.ativo)}
                onChange={(e) => handleChange('ativo', e.target.value === 'true')}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
        <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0 || loading}>
          Voltar
        </Button>
        <div className="flex gap-2">
          {step < steps.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Proxima etapa
            </Button>
          ) : (
            <Button type="submit" loading={loading}>
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

