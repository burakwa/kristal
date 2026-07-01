import { Files, Search, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  activePanel: 'explorer' | null;
  setActivePanel: (panel: 'explorer' | null) => void;
}

export default function ActivityBar({ activePanel, setActivePanel }: Props) {
  const { colors } = useTheme();

  return (
    <nav className={`w-12 flex flex-col items-center py-2 ${colors.activityBar}`}>
      <IconBtn active={activePanel === 'explorer'} onClick={() => setActivePanel(activePanel ? null : 'explorer')}>
        <Files size={24} />
      </IconBtn>
      <IconBtn active={false}><Search size={24} /></IconBtn>
      
      <div className="flex-1" />
      
      <IconBtn active={false}><Settings size={24} /></IconBtn>
    </nav>
  );
}
function IconBtn({ children, active, onClick }: any) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded mb-1 transition-colors
      ${active ? colors.iconActive : colors.iconInactive} ${colors.hover}`}
    >
      {children}
    </button>
  );
}

