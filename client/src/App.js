import { Route, Routes, Navigate } from "react-router-dom";
import Library from "./pages/Library";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  // sprawdzenie, czy użytkownik jest zalogowany
  const user = localStorage.getItem("token");

  return (
    <Routes>
      {/* start aplikacji */}
      <Route
        path="/"
        element={<Navigate to={user ? "/library" : "/login"} replace />}
      />

      {/* biblioteka – tylko po zalogowaniu */}
      <Route
        path="/library"
        element={user ? <Library /> : <Navigate to="/login" replace />}
      />

      {/* logowanie – tylko dla niezalogowanych */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/library" replace />}
      />

      {/* rejestracja – tylko dla niezalogowanych */}
      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/library" replace />}
      />

      {/* nieznane ścieżki */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
