import Papa from 'papaparse';
import { FoodEntry, DailyLog } from '../types';

export function exportDailyLogToCSV(log: DailyLog): string {
  const rows = log.entries.map(e => ({
    Date: log.date,
    Meal: e.meal,
    Food: e.name,
    Quantity: e.quantity,
    Unit: e.unit,
    Calories: e.calories,
    Protein: e.protein,
    Carbs: e.carbs,
    Fat: e.fat
  }));
  return Papa.unparse(rows);
}

interface MFPRow {
  Date?: string;
  Meal?: string;
  Food?: string;
  Calories?: string;
  Carbs?: string;
  Protein?: string;
  Fat?: string;
  Quantity?: string;
  Unit?: string;
  Category?: string;
}

export function parseMyFitnessPalCSV(csv: string): FoodEntry[] {
  const parsed = Papa.parse<MFPRow>(csv, { header: true, skipEmptyLines: true });
  const entries: FoodEntry[] = [];
  for (const row of parsed.data) {
    if (!row.Food) continue;
    const entry: FoodEntry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: row.Food,
      quantity: parseFloat(row.Quantity || '1'),
      unit: row.Unit || '',
      calories: parseFloat(row.Calories || '0'),
      protein: parseFloat(row.Protein || '0'),
      carbs: parseFloat(row.Carbs || '0'),
      fat: parseFloat(row.Fat || '0'),
      category: row.Category || '',
      meal: (row.Meal as FoodEntry['meal']) || 'déjeuner',
      timestamp: new Date().toISOString()
    };
    entries.push(entry);
  }
  return entries;
}
