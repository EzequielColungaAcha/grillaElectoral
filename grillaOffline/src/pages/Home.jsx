// /src/pages/Home.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock } from '../components/clock/Clock';
import { useDB } from '../context/dbContext';

const pad2 = (n) => String(n).padStart(2, '0');

export const Home = () => {
  const { getAllRecords, getRecord, isDBReady } = useDB();

  const [importMode, setImportMode] = useState('single');
  const [importInfo, setImportInfo] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('importMode');
      if (saved === 'multi-file' || saved === 'single') setImportMode(saved);
    } catch {}
  }, []);

  const loadImportInfo = useCallback(async () => {
    if (!isDBReady) return;

    try {
      if (importMode === 'multi-file') {
        const multi = await getRecord('multiFileImport', 'multi_file_data');
        if (multi?.fileMetadata?.length) {
          const files = multi.fileMetadata;
          const first = files[0];
          const last = files[files.length - 1];

          setImportInfo({
            type: 'multi-file',
            fileCount: files.length,
            dateRange:
              first?.displayDate && last?.displayDate
                ? `${first.displayDate} - ${last.displayDate}`
                : 'Fechas no disponibles',
          });
        } else {
          setImportInfo({
            type: 'multi-file',
            fileCount: 0,
            dateRange: 'Fechas no disponibles',
          });
        }
        return;
      }

      // Single-file path -> keep only month/year
      const exportInfoRecords = await getAllRecords('exportInfo');
      if (Array.isArray(exportInfoRecords) && exportInfoRecords.length > 0) {
        // Coerce numbers even if DB stored strings
        const raw = exportInfoRecords[0] || {};
        // Try common key variants just in case (e.g., month vs exportMonth)
        const day = Number(raw.exportDay ?? raw.day ?? raw.d);
        const month = Number(raw.exportMonth ?? raw.month ?? raw.m);
        const year = Number(raw.exportYear ?? raw.year ?? raw.y);

        // Basic sanity check (allows 1–31, 1–12, year >= 1900; tweak if needed)
        const valid =
          Number.isFinite(day) &&
          day >= 1 &&
          day <= 31 &&
          Number.isFinite(month) &&
          month >= 1 &&
          month <= 12 &&
          Number.isFinite(year) &&
          year >= 1900;

        if (valid) {
          setImportInfo({ type: 'single', day, month, year });
          return; // only return when we *really* have a good date
        }
        // else: fall through to tables[] fallback
      }

      // Fallback: infer from first table's createdAt -> month/year
      const tables = await getAllRecords('tables');
      if (Array.isArray(tables) && tables.length > 0 && tables[0]?.createdAt) {
        const d = new Date(tables[0].createdAt);
        setImportInfo({
          type: 'single',
          month: d.getMonth() + 1,
          year: d.getFullYear(),
        });
        return;
      }

      setImportInfo(null);
    } catch (err) {
      console.error('Error loading import info:', err);
      setImportInfo(null);
    }
  }, [isDBReady, importMode, getAllRecords, getRecord]);

  useEffect(() => {
    loadImportInfo();
  }, [loadImportInfo]);

  // ----- Render helpers -----
  const renderImportInfo = useCallback(() => {
    if (!importInfo)
      return <span className='opacity-70'>Sin datos importados aún.</span>;

    if (importInfo.type === 'multi-file') {
      return (
        <span>
          <strong>{importInfo.fileCount}</strong> archivo(s) importados
          {importInfo.dateRange ? ` • Rango: ${importInfo.dateRange}` : null}
        </span>
      );
    }

    // single -> MM/YYYY only (coerce safely)
    const m = Number(importInfo.month);
    const y = Number(importInfo.year);
    const valid = Number.isFinite(m) && m >= 1 && m <= 12 && Number.isFinite(y);
    const formatted = valid ? `${pad2(m)}/${y}` : 'Fecha no disponible';

    return (
      <span>
        Fecha del archivo: <strong>{formatted}</strong>
      </span>
    );
  }, [importInfo]);

  const importInfoForShow = useMemo(() => renderImportInfo(), [importInfo]);

  return (
    <div className='text-center text-slate-200 h-full pt-16 flex flex-col justify-center items-center'>
      <h1 className='uppercase text-4xl'>Grilla Electoral Dataview</h1>
      <Clock />
      <div className='flex flex-col items-center justify-center mt-10'>
        <h4 className='w-fit text-xl text-justify px-1'>
          Bienvenido/a <span className='text-lime-400'>Admin</span>.
        </h4>
        <h4 className='text-sm'>{importInfoForShow}</h4>
      </div>
    </div>
  );
};
