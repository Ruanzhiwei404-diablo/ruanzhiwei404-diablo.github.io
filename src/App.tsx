import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import ResourcesPage from './pages/ResourcesPage';
import ToolsPage from './pages/ToolsPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter basename="/ruanzhiwei404-diablo.github.io">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
