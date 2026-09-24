import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import ResourcesPage from './pages/ResourcesPage';
import ToolsPage from './pages/ToolsPage';
import AboutPage from './pages/AboutPage';
import AudioDesignPage from './pages/AudioDesignPage';
import WwisePage from './pages/WwisePage';
import MusicGenresPage from './pages/MusicGenresPage';
import SoundEffectsPage from './pages/SoundEffectsPage';
import GameEncyclopediaPage from './pages/GameEncyclopediaPage';
import GameWorldPage from './pages/GameWorldPage';
import GameMusicHandbookPage from './pages/GameMusicHandbookPage';
import SynthLabPage from './pages/SynthLabPage';
import CrystalPrismPage from './pages/CrystalPrismPage';
import SubBassPage from './pages/SubBassPage';
import CuteSynthPage from './pages/CuteSynthPage';
import VoiceLabPage from './pages/VoiceLabPage';
import GameCenterPage from './pages/GameCenterPage';
import SynthRacerPage from './pages/SynthRacerPage';
import WhoIsSpyPage from './pages/WhoIsSpyPage';
import EtAlienPage from './pages/EtAlienPage';
import PrismPlusPage from './pages/PrismPlusPage';
import BassPage from './pages/BassPage';
import MusicGraphPage from './pages/MusicGraphPage';
import InstrumentsPage from './pages/music/InstrumentsPage';
import ArtistsPage from './pages/music/ArtistsPage';
import RecordingsPage from './pages/music/RecordingsPage';
import GenresPage from './pages/music/GenresPage';

export default function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="audio" element={<AudioDesignPage />} />
          <Route path="audio/wwise" element={<WwisePage />} />
          <Route path="audio/music" element={<MusicGenresPage />} />
          <Route path="audio/sound-effects" element={<SoundEffectsPage />} />
          <Route path="game" element={<GameEncyclopediaPage />} />
          <Route path="game/world" element={<GameWorldPage />} />
          <Route path="game-center" element={<GameCenterPage />} />
          <Route path="game-center/synth-racer" element={<SynthRacerPage />} />
          <Route path="game-center/who-is-spy" element={<WhoIsSpyPage />} />
          <Route path="audio/music-handbook" element={<GameMusicHandbookPage />} />
          <Route path="audio/synth-lab" element={<SynthLabPage />} />
          <Route path="audio/synth-lab/crystal-prism" element={<CrystalPrismPage />} />
          <Route path="audio/synth-lab/crystal-prism/prism-plus" element={<PrismPlusPage />} />
          <Route path="audio/synth-lab/sub-bass" element={<SubBassPage />} />
          <Route path="audio/synth-lab/sub-bass/bass" element={<BassPage />} />
          <Route path="audio/synth-lab/cute-synth" element={<CuteSynthPage />} />
          <Route path="audio/voice-lab" element={<VoiceLabPage />} />
          <Route path="audio/voice-lab/et-alien" element={<EtAlienPage />} />
          <Route path="music" element={<MusicGraphPage />} />
          <Route path="music/instruments" element={<InstrumentsPage />} />
          <Route path="music/artists" element={<ArtistsPage />} />
          <Route path="music/recordings" element={<RecordingsPage />} />
          <Route path="music/genres" element={<GenresPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
