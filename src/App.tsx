import { BrowserRouter, Routes, Route } from "react-router-dom";
import appRoutes from "./routes/routes";
import './App.scss'
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Loading from "./components/Loading/Loading"


import { initTelegramPlatformAndSafeArea } from "./utils/telegramPlatform";
import Game from "./components/Game/Game";

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    window.Telegram.WebApp.ready();
    initTelegramPlatformAndSafeArea();
     navigate(appRoutes.LOADDING, { replace: true });
  }, []);

  return (
    <div className="App">
      
      <Routes>
        <Route path={appRoutes.LOADDING} element={<Loading />} />
        <Route path={appRoutes.GAME} element={<Game />} />

        
        
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;