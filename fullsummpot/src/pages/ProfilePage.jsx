import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../services/api";

function ProfilePage() {

  const { id } = useParams();

  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);

  const [createdCommunities, setCreatedCommunities]
    = useState([]);

  const [joinedCommunities, setJoinedCommunities]
    = useState([]);

  const [username, setUsername]
    = useState("");

  const [bio, setBio]
    = useState("");

  const [profileImage, setProfileImage]
    = useState(null);

  useEffect(() => {

    fetchProfile();

    fetchPosts();

    fetchCommunities();

  }, [id]);

  // FETCH PROFILE

  const fetchProfile = async () => {

    try {

      const response = await API.get(
        `/Auth/profile/${id}`
      );

      setUser(response.data);

      setUsername(response.data.username);

      setBio(response.data.bio || "");

    } catch (error) {

      console.log(error);

    }

  };

  // FETCH POSTS

  const fetchPosts = async () => {

    try {

      const response =
        await API.get("/Posts");

      const userPosts =
        response.data.filter(
          (post) =>
            post.userID ===
            parseInt(id)
        );

      setPosts(userPosts);

    } catch (error) {

      console.log(error);

    }

  };

  // FETCH COMMUNITIES

  const fetchCommunities = async () => {

    try {

      const response =
        await API.get("/Communities");

      const allCommunities =
        response.data;

      // CREATED

      const created =
        allCommunities.filter(
          (community) =>
            community.ownerID ===
            parseInt(id)
        );

      setCreatedCommunities(created);

      // JOINED

      const joinedResponse =
        await API.get(
          `/Communities/joined/${id}`
        );

      setJoinedCommunities(
        joinedResponse.data
      );

    } catch (error) {

      console.log(error);

    }

  };

  // UPDATE PROFILE

  const updateProfile = async () => {

    try {

      const formData = new FormData();

      formData.append(
        "username",
        username
      );

      formData.append(
        "bio",
        bio
      );

      if (profileImage) {

        formData.append(
          "profileImage",
          profileImage
        );

      }

      await API.put(
        `/Auth/profile/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      fetchProfile();

      alert("Profile Updated!");

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">

      <Navbar />

      <div className="max-w-6xl mx-auto p-8">

        {/* PROFILE CARD */}

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl mb-10">

          <div className="flex flex-col md:flex-row gap-8 items-center">

            {/* PROFILE IMAGE */}

            <div>

              {user?.profileImageUrl ? (

                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-500"
                />

              ) : (

                <div className="w-40 h-40 rounded-full bg-slate-700 flex items-center justify-center text-white text-5xl font-bold">

                  {user?.username?.charAt(0)}

                </div>

              )}

            </div>

            {/* PROFILE INFO */}

            <div className="flex-1 w-full">

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none mb-4 text-2xl font-bold"
              />

              <textarea
                placeholder="Write your bio..."
                value={bio}
                onChange={(e) =>
                  setBio(
                    e.target.value
                  )
                }
                className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none mb-4"
              />

              <input
                type="file"
                onChange={(e) =>
                  setProfileImage(
                    e.target.files[0]
                  )
                }
                className="text-white mb-4"
              />

              <button
                onClick={updateProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
              >
                Save Profile
              </button>

            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white/10 p-6 rounded-3xl border border-white/10">

            <h2 className="text-3xl font-bold text-white mb-2">
              {posts.length}
            </h2>

            <p className="text-slate-300">
              Posts
            </p>

          </div>

          <div className="bg-white/10 p-6 rounded-3xl border border-white/10">

            <h2 className="text-3xl font-bold text-white mb-2">
              {createdCommunities.length}
            </h2>

            <p className="text-slate-300">
              Communities Created
            </p>

          </div>

          <div className="bg-white/10 p-6 rounded-3xl border border-white/10">

            <h2 className="text-3xl font-bold text-white mb-2">
              {joinedCommunities.length}
            </h2>

            <p className="text-slate-300">
              Communities Joined
            </p>

          </div>

        </div>

        {/* CREATED COMMUNITIES */}

        <div className="mb-10">

          <h2 className="text-3xl font-bold text-white mb-5">
            Communities Created
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {createdCommunities.map((community) => (

              <div
                key={community.communityID}
                onClick={() =>
                  window.location.href =
                  `/community/${community.communityID}`
                }
                className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.02] transition-all"
              >

                {/* BANNER */}

                <div className="h-44">

                  {community.bannerUrl ? (

                    <img
                      src={community.bannerUrl}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full bg-slate-800" />

                  )}

                </div>

                {/* CONTENT */}

                <div className="p-6">

                  <h3 className="text-3xl font-bold text-white mb-3">
                    {community.name}
                  </h3>

                  <p className="text-slate-300 mb-5">
                    {community.description}
                  </p>

                  <div className="flex gap-3">

                    <button
                      onClick={(e) => {

                        e.stopPropagation();

                        window.location.href =
                          `/community/${community.communityID}`;

                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition-all"
                    >
                      Open
                    </button>

                    <button
                      onClick={async (e) => {

                        e.stopPropagation();

                        try {

                          await API.delete(
                            `/Communities/${community.communityID}`
                          );

                          fetchCommunities();

                        } catch (error) {

                          console.log(error);

                        }

                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition-all"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* JOINED COMMUNITIES */}

        <div className="mb-10">

          <h2 className="text-3xl font-bold text-white mb-5">
            Communities Joined
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {joinedCommunities.map((community) => (

              <div
                key={community.communityID}
                onClick={() =>
                  window.location.href =
                  `/community/${community.communityID}`
                }
                className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.02] transition-all"
              >

                {/* BANNER */}

                <div className="h-44">

                  {community.bannerUrl ? (

                    <img
                      src={community.bannerUrl}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full bg-slate-800" />

                  )}

                </div>

                {/* CONTENT */}

                <div className="p-6">

                  <h3 className="text-3xl font-bold text-white mb-3">
                    {community.name}
                  </h3>

                  <p className="text-slate-300">
                    {community.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

}

export default ProfilePage;