import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TabBar from "./components/TabBar.jsx";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import { SettingsProvider } from "./hooks/useSettings.jsx";
import { ThemeProvider } from "./hooks/useTheme.jsx";
import Achievements from "./pages/Achievements.jsx";
import Exercises from "./pages/Exercises.jsx";
import History from "./pages/History.jsx";
import HistoryDetail from "./pages/HistoryDetail.jsx";
import Login from "./pages/Login.jsx";
import Plans from "./pages/Plans.jsx";
import Settings from "./pages/Settings.jsx";
import Stats from "./pages/Stats.jsx";
import TemplateDetail from "./pages/TemplateDetail.jsx";
import Templates from "./pages/Templates.jsx";
import Today from "./pages/Today/index.jsx";

function AppRoutes() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate replace to="/" /> : <Login />}
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Today />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:id" element={<TemplateDetail />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:date" element={<HistoryDetail />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
        {isAuthenticated && <TabBar />}
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
