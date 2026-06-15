// Formata valor para moeda brasileira
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formata data no padrão brasileiro
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

// Calcula meses entre duas datas
export function monthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
}

// Formata data e hora relativa ("há 2h")
export function timeAgo(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `há ${Math.floor(diff / 86400)}d`;
  return formatDate(dateString);
}

// Valida e-mail institucional da Univates (domínio univates.br)
export function isUniversityEmail(email: string): boolean {
  return email.toLowerCase().trim().endsWith('univates.br');
}

// Adiciona meses a uma data
export function addMonths(dateString: string, months: number): string {
  const d = new Date(dateString);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

// Retorna o label de status de reserva em português
export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Concluído',
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: '#F39C12',
    confirmed: '#27AE60',
    cancelled: '#E74C3C',
    completed: '#6C757D',
  };
  return map[status] || '#6C757D';
}
