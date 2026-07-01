import { FileText, Folder } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ExplorerPanel() {
  return (
    <>
      <div className="h-9 flex items-center px-4 text-[11px] uppercase font-bold tracking-wider opacity-60">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto text-[13px] p-1">
        <FileItem name="src" icon={<Folder size={14} className="text-yellow-500" />} />
        <FileItem name="App.tsx" icon={<FileText size={14} className="text-blue-400" />} indent />
        <FileItem name="package.json" icon={<FileText size={14} className="text-green-400" />} />
      </div>
    </>
  );
}

function FileItem({ name, icon, indent }: { name: string; icon: React.ReactNode; indent?: boolean }) {
  const { colors } = useTheme();
  return (
    <div className={`flex items-center h-7 px-2 rounded cursor-pointer ${indent ? 'ml-4' : ''} ${colors.hover}`}>
      <span className="mr-2">{icon}</span>
      <span>{name}</span>
    </div>
  );
}