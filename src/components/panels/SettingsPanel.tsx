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
        <div className="rounded border p-3 space-y-3 ${colors.border} ${colors.bg}">
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
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={() => setShowLineNumbers(!showLineNumbers)}
                className="form-checkbox h-4 w-4 rounded"
              />
              <span>Satır numaralarını göster</span>
            </label>
            <span className="text-[12px] opacity-70">PDF görüntüleme için.</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={() => setAutoSave(!autoSave)}
                className="form-checkbox h-4 w-4 rounded"
              />
              <span>Otomatik kaydet</span>
            </label>
            <span className="text-[12px] opacity-70">Yapılan değişiklikleri otomatik kaydeder.</span>
          </div>
        </div>
      </div>
    </>
  );
}
