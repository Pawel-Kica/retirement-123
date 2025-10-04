/**
 * ExportButton Component - Trigger XLS export
 */

'use client';

import React from 'react';
import { Button } from '@/components/shared/Button';
import { generateAdminExport } from '@/lib/admin-export';
import type { SimulationRecord } from '@/types';

interface ExportButtonProps {
  simulations: SimulationRecord[];
}

export function ExportButton({ simulations }: ExportButtonProps) {
  const handleExport = () => {
    if (simulations.length === 0) {
      alert('Brak danych do eksportu');
      return;
    }

    try {
      generateAdminExport(simulations);
    } catch (error) {
      console.error('Export error:', error);
      alert('Błąd podczas eksportu danych');
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleExport}
      disabled={simulations.length === 0}
      className="w-full text-lg py-4"
    >
      Pobierz export (XLS) — {simulations.length} {simulations.length === 1 ? 'symulacja' : 'symulacji'}
    </Button>
  );
}
