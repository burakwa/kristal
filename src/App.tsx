import { useState } from 'react';
import { ThemeProvider , useTheme } from './context/ThemeContext';
import TitleBar from './components/TitleBar';
import ActivityBar from './components/ActivityBar';
import SideBar from './components/SideBar';
import EditorArea from './components/EditorArea';
import StatusBar from './components/StatusBar';

function App() {
  const [activePanel, setActivePanel] = useState<'explorer' | null>('explorer');

  return (
    <ThemeProvider>
      <MainLayout activePanel={activePanel} setActivePanel={setActivePanel} />
    </ThemeProvider>
  );
}

function MainLayout({ activePanel, setActivePanel }: any) {
  const { colors } = useTheme();

  return (
    <div className={`h-screen flex flex-col ${colors.bg} ${colors.text} transition-colors duration-200`}>
      <TitleBar />
      <main className="flex flex-1 overflow-hidden">
        <ActivityBar activePanel={activePanel} setActivePanel={setActivePanel} />
        {activePanel && <SideBar />}
        <EditorArea />
      </main>
      <StatusBar />
    </div>
  );
}

export default App;