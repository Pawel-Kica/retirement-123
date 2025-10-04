/**
 * Admin Export - Generate XLS/CSV file with simulation data
 */

import * as XLSX from 'xlsx';
import type { SimulationRecord } from '@/types';
import { formatDate, getGenderShort } from './utils';

export function generateAdminExport(simulations: SimulationRecord[]): void {
  // Transform data to match required columns
  const data = simulations.map((sim) => {
    const timestamp = new Date(sim.timestamp);
    const date = timestamp.toLocaleDateString('pl-PL');
    const time = timestamp.toLocaleTimeString('pl-PL');

    return {
      'Data użycia': date,
      'Godzina użycia': time,
      'Emerytura oczekiwana': sim.expectedPension,
      'Wiek': sim.age,
      'Płeć': getGenderShort(sim.gender),
      'Wysokość wynagrodzenia': sim.salary,
      'Czy uwzględniał okresy choroby': sim.includeL4 ? 'Tak' : 'Nie',
      'Wysokość zgromadzonych środków na koncie': sim.accountBalance || '',
      'Wysokość zgromadzonych środków na subkoncie': sim.subaccountBalance || '',
      'Emerytura rzeczywista (nominalna)': sim.nominalPension,
      'Emerytura urealniona': sim.realPension,
      'Kod pocztowy': sim.postalCode || '',
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Symulacje');

  // Generate filename with current date
  const today = new Date().toISOString().split('T')[0];
  const filename = `symulacje_export_${today}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}
