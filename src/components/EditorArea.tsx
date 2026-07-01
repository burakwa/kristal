import { useTheme } from '../context/ThemeContext';

export default function EditorArea() {
  const { colors } = useTheme();

  return (
    <section className="flex-1 flex flex-col">
      <div className={`h-9 flex items-center px-4 text-sm border-b ${colors.sideBar} ${colors.border}`}>
        Welcome
      </div>
      
      <div className="flex-1 flex items-center justify-center opacity-40 text-lg">
        PDF yüklemek için dosya seçin
      </div>
    </section>
  );
}