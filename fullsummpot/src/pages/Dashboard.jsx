import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {

      navigate("/");

    }

  }, [navigate]);

  return (

  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">

    <Navbar />

    <div className="p-8">

      <div className="mb-10">

        <h1 className="text-5xl font-bold text-white mb-3">
          Welcome Back 👋
        </h1>

        <p className="text-slate-400 text-lg">
          Manage your communities and explore FullSummpot.
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-slate-300 text-lg mb-2">
            Communities
          </h2>

          <p className="text-5xl font-bold text-white">
            12
          </p>

        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-slate-300 text-lg mb-2">
            Active Users
          </h2>

          <p className="text-5xl font-bold text-white">
            324
          </p>

        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-slate-300 text-lg mb-2">
            Your Posts
          </h2>

          <p className="text-5xl font-bold text-white">
            28
          </p>

        </div>

      </div>

    </div>

  </div>

);

}

export default Dashboard;