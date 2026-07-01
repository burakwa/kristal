import { useTheme } from '../context/ThemeContext';
import ExplorerPanel from './panels/ExplorerPanel';
import SearchPanel from './panels/SearchPanel';
import SettingsPanel from './panels/SettingsPanel';

interface Props {
  activePanel: 'explorer' | 'search' | 'settings' | null;
}

export default function SideBar({ activePanel }: Props) {
  const { colors } = useTheme();

  return (
    <aside className={`w-60 flex flex-col border-r ${colors.sideBar} ${colors.border}`}>
      {/* Hangi panel açıksa onu göster */}
      {activePanel === 'explorer' && <ExplorerPanel />}
      {activePanel === 'search' && <SearchPanel />}
      {activePanel === 'settings' && <SettingsPanel />}
    </aside>
  );
}