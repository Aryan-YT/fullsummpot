import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../services/api";

function Dashboard() {

  const navigate = useNavigate();

  const [communities, setCommunities] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {

      navigate("/");

    }

    fetchCommunities();

  }, [navigate]);

  const fetchCommunities = async () => {

    try {

      const response = await API.get("/Communities");

      setCommunities(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  const createCommunity = async () => {

    try {

      await API.post("/Communities", {
        name,
        description
      });

      setName("");
      setDescription("");

      fetchCommunities();

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">

      <Navbar />

      <div className="p-8">

        <div className="mb-10">

          <h1 className="text-5xl font-bold text-white mb-3">
            Communities 🚀
          </h1>

          <p className="text-slate-400 text-lg">
            Create and explore communities.
          </p>

        </div>

        {/* CREATE COMMUNITY */}

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl mb-10">

          <h2 className="text-2xl text-white font-bold mb-5">
            Create Community
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Community Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none"
            />

            <button
              onClick={createCommunity}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              Create
            </button>

          </div>

        </div>

        {/* COMMUNITY LIST */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {communities.map((community) => (

            <div
              key={community.communityID}
              className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl"
            >

              <h2 className="text-2xl font-bold text-white mb-3">
                {community.name}
              </h2>

              <p className="text-slate-300">
                {community.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default Dashboard;