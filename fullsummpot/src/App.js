import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import CommunityPage from "./pages/CommunityPage";
import ProfilePage from "./pages/ProfilePage";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/feed"
          element={<Feed />}
        />

        <Route
          path="/community/:id"
          element={<CommunityPage />}
        />

        <Route
          path="/profile/:id"
          element={<ProfilePage />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;