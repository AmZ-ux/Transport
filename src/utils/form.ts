export function formatarTelefoneInput(valor: string): string {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length <= 10) {
    return numeros.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }

  return numeros.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}
