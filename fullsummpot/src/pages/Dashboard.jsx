import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function Dashboard() {

  const navigate = useNavigate();

  const user = getUserData();

  const [communities, setCommunities] = useState([]);

  const [filteredCommunities,
    setFilteredCommunities]
    = useState([]);

  const [search, setSearch]
    = useState("");

  const [filteredUsers,
    setFilteredUsers]
    = useState([]);

  const [name, setName]
    = useState("");

  const [description,
    setDescription]
    = useState("");

  const [banner, setBanner]
    = useState(null);

  const [editingCommunityID,
    setEditingCommunityID]
    = useState(null);

  const [editName,
    setEditName]
    = useState("");

  const [editDescription,
    setEditDescription]
    = useState("");

  const [editBanner,
    setEditBanner]
    = useState(null);

  // FETCH COMMUNITIES

  useEffect(() => {

    fetchCommunities();

  }, []);

  // REQUIRE LOGIN

  const requireLogin = () => {

    alert(
      "Please login or register first."
    );

    navigate("/login");

  };

  // SEARCH FILTER

  useEffect(() => {

    // COMMUNITY FILTER

    const filtered =
      communities.filter((community) =>
        community.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );

    setFilteredCommunities(
      filtered
    );

    // USER SEARCH

    if (search.trim() !== "") {

      searchUsers();

    } else {

      setFilteredUsers([]);

    }

  }, [search, communities]);

  // FETCH COMMUNITIES

  const fetchCommunities = async () => {

    try {

      const response =
        await API.get("/Communities");

      setCommunities(response.data);

      setFilteredCommunities(
        response.data
      );

    } catch (error) {

      console.log(error);

    }

  };

  // SEARCH USERS

  const searchUsers = async () => {

    try {

      const response =
        await API.get(
          `/Auth/search?username=${search}`
        );

      setFilteredUsers(
        response.data
      );

    } catch (error) {

      console.log(error);

    }

  };

  // CREATE COMMUNITY

  const createCommunity = async () => {

    if (!user) {

      requireLogin();

      return;

    }

    try {

      const formData =
        new FormData();

      formData.append(
        "name",
        name
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "ownerID",
        parseInt(user.UserID)
      );

      if (banner) {

        formData.append(
          "banner",
          banner
        );

      }

      const response =
        await API.post(
          "/Communities",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

      // AUTO JOIN OWNER

      await API.post(
        "/Communities/join",
        {
          userID:
            parseInt(user.UserID),

          communityID:
            response.data.communityID
        }
      );

      setName("");

      setDescription("");

      setBanner(null);

      fetchCommunities();

    } catch (error) {

      console.log(error);

    }

  };

  // JOIN COMMUNITY

  const joinCommunity = async (
    communityID
  ) => {

    if (!user) {

      requireLogin();

      return;

    }

    try {

      await API.post(
        "/Communities/join",
        {
          userID:
            parseInt(user.UserID),

          communityID
        }
      );

      alert(
        "Joined Community!"
      );

    } catch (error) {

      console.log(error);

      alert(
        "Already Joined"
      );

    }

  };

  // DELETE COMMUNITY

  const deleteCommunity = async (
    communityID
  ) => {

    if (!user) {

      requireLogin();

      return;

    }

    try {

      await API.delete(
        `/Communities/${communityID}`
      );

      fetchCommunities();

    } catch (error) {

      console.log(error);

    }

  };

  // START EDIT

  const startEdit = (
    community
  ) => {

    setEditingCommunityID(
      community.communityID
    );

    setEditName(
      community.name
    );

    setEditDescription(
      community.description
    );

  };

  // UPDATE COMMUNITY

  const updateCommunity = async (
    communityID
  ) => {

    if (!user) {

      requireLogin();

      return;

    }

    try {

      const formData =
        new FormData();

      formData.append(
        "name",
        editName
      );

      formData.append(
        "description",
        editDescription
      );

      if (editBanner) {

        formData.append(
          "banner",
          editBanner
        );

      }

      await API.put(
        `/Communities/${communityID}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      setEditingCommunityID(
        null
      );

      fetchCommunities();

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">

      <Navbar />

      <div className="p-4 md:p-8">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Communities 🚀
          </h1>

          <p className="text-slate-400 text-base md:text-lg">
            Create and explore communities.
          </p>

        </div>

        {/* SEARCH */}

        <div className="mb-10">

          <input
            type="text"
            placeholder="Search communities or users..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full p-3 md:p-4 rounded-2xl bg-slate-900/70 border border-slate-700 text-white outline-none"
          />

          {/* SUGGESTIONS */}

          {search && (

            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl mt-3 overflow-hidden">

              {/* COMMUNITIES */}

              {filteredCommunities
                .slice(0, 5)
                .map((community) => (

                  <div
                    key={
                      community.communityID
                    }
                    onClick={() =>
                      navigate(
                        `/community/${community.communityID}`
                      )
                    }
                    className="p-4 text-white hover:bg-slate-800 cursor-pointer border-b border-slate-700"
                  >

                    <span className="text-blue-400 mr-2">
                      Community:
                    </span>

                    {community.name}

                  </div>

                ))}

              {/* USERS */}

              {filteredUsers
                .slice(0, 5)
                .map((searchedUser) => (

                  <div
                    key={
                      searchedUser.userID
                    }
                    onClick={() =>
                      navigate(
                        `/profile/${searchedUser.userID}`
                      )
                    }
                    className="p-4 text-white hover:bg-slate-800 cursor-pointer border-b border-slate-700 flex items-center gap-3"
                  >

                    {searchedUser.profileImageUrl ? (

                      <img
                        src={
                          searchedUser.profileImageUrl
                        }
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />

                    ) : (

                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">

                        {searchedUser.username?.charAt(0)}

                      </div>

                    )}

                    <div>

                      <span className="text-green-400 mr-2">
                        User:
                      </span>

                      {searchedUser.username}

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>

        {/* CREATE COMMUNITY */}

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl mb-10">

          <h2 className="text-2xl text-white font-bold mb-5">
            Create Community
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Community Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none"
            />

            <input
              type="file"
              onChange={(e) =>
                setBanner(
                  e.target.files[0]
                )
              }
              className="text-white"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {filteredCommunities.map(
            (community) => (

              <div
                key={
                  community.communityID
                }
                onClick={() =>
                  navigate(
                    `/community/${community.communityID}`
                  )
                }
                className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.02] transition-all"
              >

                <div className="relative h-52">

                  {community.bannerUrl ? (

                    <img
                      src={
                        community.bannerUrl
                      }
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full bg-slate-800" />

                  )}

                  <div className="absolute inset-0 bg-black/40 flex items-end">

                    <div className="p-6">

                      <h2 className="text-2xl md:text-4xl font-bold text-white">
                        {community.name}
                      </h2>

                    </div>

                  </div>

                </div>

                <div className="p-4 md:p-6">

                  <p className="text-slate-300 mb-5">
                    {community.description}
                  </p>

                  {user &&
                    parseInt(
                      user.UserID
                    ) ===
                      community.ownerID ? (

                    <div className="flex flex-wrap gap-3">

                      <button
                        onClick={(e) => {

                          e.stopPropagation();

                          startEdit(
                            community
                          );

                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-xl transition-all"
                      >
                        Edit
                      </button>

                      <button
                        onClick={(e) => {

                          e.stopPropagation();

                          deleteCommunity(
                            community.communityID
                          );

                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition-all"
                      >
                        Delete
                      </button>

                    </div>

                  ) : (

                    <button
                      onClick={(e) => {

                        e.stopPropagation();

                        joinCommunity(
                          community.communityID
                        );

                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition-all"
                    >
                      Join Community
                    </button>

                  )}

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>

  );

}

export default Dashboard;