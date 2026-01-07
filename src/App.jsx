import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import Exercises from "./pages/Exercises.jsx";
import History from "./pages/History.jsx";
import HistoryDetail from "./pages/HistoryDetail.jsx";
import Login from "./pages/Login.jsx";
import Today from "./pages/Today.jsx";

function AppRoutes() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-app-bg text-app-text">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate replace to="/" /> : <Login />}
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Today />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:date" element={<HistoryDetail />} />
            <Route path="/exercises" element={<Exercises />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
