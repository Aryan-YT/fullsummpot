import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import CommunityPage from "./pages/CommunityPage";
import ProfilePage from "./pages/ProfilePage";
import CommunitiesPage from "./pages/CommunitiesPage";
import MyLinksPage from "./pages/MyLinksPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import TermsPage from "./pages/TermsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/community/:id" element={<CommunityPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/my-links" element={<MyLinksPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;