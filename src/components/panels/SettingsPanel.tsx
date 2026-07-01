import { useState } from 'react';
import { Moon, Sun, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsPanel() {
  const { isDark, toggleTheme, colors } = useTheme();
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  return (
    <>
      <div className="h-9 flex items-center px-4 text-[11px] uppercase font-bold tracking-wider opacity-60">
        Settings
      </div>

      <div className="p-3 flex flex-col gap-4 text-[13px]">
        <div className={`rounded border p-3 space-y-3 ${colors.border} ${colors.bg}`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-sky-500">
            <SlidersHorizontal size={16} />
            Genel Ayarlar
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Tema</div>
              <div className="text-[12px] opacity-70">Uygulama temasını değiştir.</div>
            </div>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded flex items-center gap-2 border ${colors.border} ${colors.hover}`}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              {isDark ? 'Açık tema' : 'Koyu tema'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Satır numaralarını göster</div>
              <div className="text-[12px] opacity-70">PDF görüntüleme için.</div>
            </div>
            <ToggleSwitch checked={showLineNumbers} onChange={() => setShowLineNumbers(!showLineNumbers)} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Otomatik kaydet</div>
              <div className="text-[12px] opacity-70">Yapılan değişiklikleri otomatik kaydeder.</div>
            </div>
            <ToggleSwitch checked={autoSave} onChange={() => setAutoSave(!autoSave)} />
          </div>
        </div>
      </div>
    </>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 ${checked ? 'bg-sky-500' : 'bg-slate-300'}`}
      aria-pressed={checked}
    >
      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}
