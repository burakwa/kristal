import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function SearchPanel() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  
  // Arama filtreleri (VS Code'daki Aa, W, .* butonları)
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  // Şimdilik sahte sonuçlar (İleride PDF'ten gerçek metin çekip burada filtreleyeceğiz)
  const mockResults = query ? [
    { file: 'App.tsx', line: 12, text: `... const [${query}, set${query}] = useState ...` },
    { file: 'App.tsx', line: 45, text: `... return <div>{${query}}</div> ...` },
  ] : [];

  return (
    <>
      {/* Başlık */}
      <div className="h-9 flex items-center px-4 text-[11px] uppercase font-bold tracking-wider opacity-60">
        Search
      </div>

      <div className="p-2 flex flex-col gap-2">
        {/* Ana Arama Input'u */}
        <div className={`flex items-center px-2 h-7 rounded border ${colors.border} ${colors.bg}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className={`flex-1 bg-transparent outline-none text-[13px] ${colors.text} placeholder:opacity-40`}
          />
        </div>

        {/* Filtre Butonları (Aa, W, .*) */}
        <div className="flex items-center gap-1">
          <FilterBtn active={matchCase} onClick={() => setMatchCase(!matchCase)} title="Match Case">
            Aa
          </FilterBtn>
          <FilterBtn active={matchWholeWord} onClick={() => setMatchWholeWord(!matchWholeWord)} title="Match Whole Word">
            W
          </FilterBtn>
          <FilterBtn active={useRegex} onClick={() => setUseRegex(!useRegex)} title="Use Regular Expression">
            .*
          </FilterBtn>
        </div>

        {/* Sonuçlar Alanı */}
        <div className="mt-2 text-[12px]">
          {query && (
            <>
              <div className="px-2 py-1 opacity-60 uppercase text-[10px] font-bold">
                {mockResults.length} results in 1 file
              </div>
              
              {/* Dosya Grubu */}
              <div className={`flex items-center h-7 px-2 font-bold ${colors.hover} cursor-pointer`}>
                <ChevronDown size={14} className="mr-1" />
                <FileText size={14} className="mr-2 text-blue-400" />
                <span>App.tsx</span>
              </div>

              {/* Satır Sonuçları */}
              {mockResults.map((res, i) => (
                <div key={i} className={`flex flex-col px-2 py-1 pl-8 cursor-pointer ${colors.hover}`}>
                  <span className="opacity-60 text-[10px]">Line {res.line}</span>
                  <span className="truncate opacity-80">{res.text}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// Mini Filtre Butonu Bileşeni
function FilterBtn({ children, active, onClick, title }: { children: React.ReactNode; active: boolean; onClick: () => void; title: string }) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-6 flex items-center justify-center text-[11px] font-bold rounded transition-colors
        ${active ? 'bg-[#007acc] text-white' : `${colors.hover} opacity-60 hover:opacity-100`}`}
    >
      {children}
    </button>
  );
}