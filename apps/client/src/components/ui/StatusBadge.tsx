import React from 'react';

export type ToyotaStatus = 'Agendado' | 'Em Produção' | 'Pintura' | 'Qualidade' | 'Pronto';

interface StatusBadgeProps {
  status: ToyotaStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    'Agendado': 'bg-gray-100 text-status-waiting border-gray-300',
    'Em Produção': 'bg-blue-50 text-status-production border-blue-200',
    'Pintura': 'bg-purple-50 text-purple-700 border-purple-200',
    'Qualidade': 'bg-amber-50 text-amber-800 border-amber-200',
    'Pronto': 'bg-green-50 text-status-ready border-green-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles['Agendado']}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
};