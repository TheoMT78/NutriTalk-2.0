import React, { useRef } from 'react';
import { DailyLog, FoodEntry } from '../types';
import { parseMyFitnessPalCSV, exportDailyLogToCSV } from '../utils/myFitnessPal';

interface Props {
  log: DailyLog;
  onImport: (entries: FoodEntry[]) => void;
}

const MFPImportExport: React.FC<Props> = ({ log, onImport }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const csv = exportDailyLogToCSV(log);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritalk-${log.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const entries = parseMyFitnessPalCSV(text);
      onImport(entries);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="text/csv"
        ref={fileRef}
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Importer depuis MyFitnessPal
      </button>
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ml-2"
      >
        Exporter vers CSV
      </button>
    </div>
  );
};

export default MFPImportExport;
