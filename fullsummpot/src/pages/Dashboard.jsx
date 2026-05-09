import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function Dashboard() {

  const navigate = useNavigate();

  const user = getUserData();

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

  // FETCH COMMUNITIES

  const fetchCommunities = async () => {

    try {

      const response = await API.get("/Communities");

      setCommunities(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  // CREATE COMMUNITY

  const createCommunity = async () => {

    try {

      const response = await API.post("/Communities", {

        name,
        description,
        ownerID: parseInt(user.UserID)

      });

      // AUTO JOIN OWNER

      await API.post("/Communities/join", {

        userID: parseInt(user.UserID),

        communityID: response.data.communityID

      });

      setName("");
      setDescription("");

      fetchCommunities();

    } catch (error) {

      console.log(error);

    }

  };

  // JOIN COMMUNITY

  const joinCommunity = async (communityID) => {

    try {

      await API.post("/Communities/join", {

        userID: parseInt(user.UserID),
        communityID: communityID

      });

      alert("Joined Community!");

    } catch (error) {

      console.log(error);

      alert("Already Joined");

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">

      <Navbar />

      <div className="p-8">

        {/* HEADER */}

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
              onClick={() => navigate(`/community/${community.communityID}`)}
              className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl cursor-pointer hover:scale-105 transition-all"
            >

              <h2 className="text-2xl font-bold text-white mb-3">
                {community.name}
              </h2>

              <p className="text-slate-300 mb-4">
                {community.description}
              </p>

              {/* OWNER BADGE */}

              {parseInt(user.UserID) === community.ownerID && (

                <div className="mb-4">

                  <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    Owner
                  </span>

                </div>

              )}

              {/* JOIN BUTTON */}

              {parseInt(user.UserID) !== community.ownerID && (

                <button
                  onClick={(e) => {

                    e.stopPropagation();

                    joinCommunity(community.communityID);

                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition-all"
                >
                  Join Community
                </button>

              )}

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default Dashboard;