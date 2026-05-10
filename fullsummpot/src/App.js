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

        {/* HOME */}

        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* FEED */}

        <Route
          path="/feed"
          element={<Feed />}
        />

        {/* COMMUNITY PAGE */}

        <Route
          path="/community/:id"
          element={<CommunityPage />}
        />

        {/* PROFILE PAGE */}

        <Route
          path="/profile/:id"
          element={<ProfilePage />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;