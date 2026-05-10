import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function ProfilePage() {

  const { id } = useParams();

  const currentUser =
    getUserData();

  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);

  const [createdCommunities,
    setCreatedCommunities]
    = useState([]);

  const [joinedCommunities,
    setJoinedCommunities]
    = useState([]);

  const [username, setUsername]
    = useState("");

  const [bio, setBio]
    = useState("");

  const [profileImage,
    setProfileImage]
    = useState(null);

  // FOLLOW STATES

  const [followersCount,
    setFollowersCount]
    = useState(0);

  const [followingCount,
    setFollowingCount]
    = useState(0);

  const [isFollowing,
    setIsFollowing]
    = useState(false);

  const [followers,
    setFollowers]
    = useState([]);

  const [following,
    setFollowing]
    = useState([]);

  const [showFollowers,
    setShowFollowers]
    = useState(false);

  const [showFollowing,
    setShowFollowing]
    = useState(false);

  useEffect(() => {

    fetchProfile();

    fetchPosts();

    fetchCommunities();

    fetchFollowers();

    fetchFollowing();

    checkFollowing();

  }, [id]);

  // FETCH PROFILE

  const fetchProfile = async () => {

    try {

      const response =
        await API.get(
          `/Auth/profile/${id}`
        );

      setUser(response.data);

      setUsername(
        response.data.username
      );

      setBio(
        response.data.bio || ""
      );

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

  const fetchCommunities =
    async () => {

      try {

        const response =
          await API.get(
            "/Communities"
          );

        const allCommunities =
          response.data;

        // CREATED

        const created =
          allCommunities.filter(
            (community) =>
              community.ownerID ===
              parseInt(id)
          );

        setCreatedCommunities(
          created
        );

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

  // FETCH FOLLOWERS

  const fetchFollowers =
    async () => {

      try {

        const response =
          await API.get(
            `/Auth/followers/${id}`
          );

        setFollowers(
          response.data
        );

        setFollowersCount(
          response.data.length
        );

      } catch (error) {

        console.log(error);

      }

    };

  // FETCH FOLLOWING

  const fetchFollowing =
    async () => {

      try {

        const response =
          await API.get(
            `/Auth/following/${id}`
          );

        setFollowing(
          response.data
        );

        setFollowingCount(
          response.data.length
        );

      } catch (error) {

        console.log(error);

      }

    };

  // CHECK FOLLOWING

  const checkFollowing =
    async () => {

      if (!currentUser)
        return;

      try {

        const response =
          await API.get(
            `/Auth/isfollowing?followerID=${currentUser.UserID}&followingID=${id}`
          );

        setIsFollowing(
          response.data
            .isFollowing
        );

      } catch (error) {

        console.log(error);

      }

    };

  // FOLLOW USER

  const followUser =
    async () => {

      if (!currentUser) {

        alert(
          "Please login first"
        );

        return;

      }

      try {

        const response =
          await API.post(
            "/Auth/follow",
            {
              followerID:
                parseInt(
                  currentUser.UserID
                ),

              followingID:
                parseInt(id)
            }
          );

        setIsFollowing(
          response.data
            .following
        );

        fetchFollowers();

      } catch (error) {

        console.log(error);

      }

    };

  // UPDATE PROFILE

  const updateProfile =
    async () => {

      try {

        const formData =
          new FormData();

        formData.append(
          "username",
          username
        );

        formData.append(
          "bio",
          bio
        );

        formData.append(
          "userID",
          currentUser.UserID
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

        alert(
          "Profile Updated!"
        );

      } catch (error) {

        console.log(error);

      }

    };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">

      <Navbar />

      <div className="max-w-6xl mx-auto p-4 md:p-8">

        {/* PROFILE CARD */}

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl mb-10">

          <div className="flex flex-col md:flex-row gap-8 items-center">

            {/* PROFILE IMAGE */}

            <div>

              {user?.profileImageUrl ? (

                <img
                  src={
                    user.profileImageUrl
                  }
                  alt="Profile"
                  className="w-28 h-28 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-500"
                />

              ) : (

                <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-slate-700 flex items-center justify-center text-white text-3xl md:text-5xl font-bold">

                  {user?.username?.charAt(
                    0
                  )}

                </div>

              )}

            </div>

            {/* PROFILE INFO */}

            <div className="flex-1 w-full">

              {/* OWN PROFILE */}

              {currentUser &&
                parseInt(currentUser.UserID)
                === parseInt(id) ? (

                <>

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

                </>

              ) : (

                /* WATCHER VIEW */

                <>

                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center md:text-left">
                    {user?.username}
                  </h1>

                  {user?.bio && (

                    <p className="text-slate-300 text-base md:text-xl mb-6 text-center md:text-left">
                      {user.bio}
                    </p>

                  )}

                  {/* FOLLOW BUTTON */}

                  {currentUser && (

                    <button
                      onClick={followUser}
                      className={`px-6 py-3 rounded-xl transition-all text-white ${isFollowing
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-600 hover:bg-green-700"
                        }`}
                    >

                      {isFollowing
                        ? "Unfollow"
                        : "Follow"}

                    </button>

                  )}

                </>

              )}

            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-10">

          <div className="bg-white/10 p-4 md:p-6 rounded-3xl border border-white/10">

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {posts.length}
            </h2>

            <p className="text-slate-300">
              Posts
            </p>

          </div>

          <div className="bg-white/10 p-6 rounded-3xl border border-white/10">

            <h2 className="text-3xl font-bold text-white mb-2">
              {
                createdCommunities.length
              }
            </h2>

            <p className="text-slate-300">
              Created
            </p>

          </div>

          <div className="bg-white/10 p-6 rounded-3xl border border-white/10">

            <h2 className="text-3xl font-bold text-white mb-2">
              {
                joinedCommunities.length
              }
            </h2>

            <p className="text-slate-300">
              Joined
            </p>

          </div>

          <div
            onClick={() =>
              setShowFollowers(
                !showFollowers
              )
            }
            className="bg-white/10 p-6 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
          >

            <h2 className="text-3xl font-bold text-white mb-2">
              {followersCount}
            </h2>

            <p className="text-slate-300">
              Followers
            </p>

          </div>

          <div
            onClick={() =>
              setShowFollowing(
                !showFollowing
              )
            }
            className="bg-white/10 p-6 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
          >

            <h2 className="text-3xl font-bold text-white mb-2">
              {followingCount}
            </h2>

            <p className="text-slate-300">
              Following
            </p>

          </div>

        </div>

        {/* FOLLOWERS */}

        {showFollowers && (

          <div className="bg-white/10 border border-white/10 rounded-3xl p-4 md:p-6 mb-10">

            <h2 className="text-3xl font-bold text-white mb-5">
              Followers
            </h2>

            <div className="space-y-4">

              {followers.map(
                (follower) => (

                  <div
                    key={
                      follower.userID
                    }
                    onClick={() =>
                      window.location.href =
                      `/profile/${follower.userID}`
                    }
                    className="bg-slate-800 p-4 rounded-2xl cursor-pointer hover:bg-slate-700 transition-all"
                  >

                    <h3 className="text-white text-xl font-bold">
                      {
                        follower.username
                      }
                    </h3>

                  </div>

                )
              )}

            </div>

          </div>

        )}

        {/* FOLLOWING */}

        {showFollowing && (

          <div className="bg-white/10 border border-white/10 rounded-3xl p-6 mb-10">

            <h2 className="text-3xl font-bold text-white mb-5">
              Following
            </h2>

            <div className="space-y-4">

              {following.map(
                (user) => (

                  <div
                    key={user.userID}
                    onClick={() =>
                      window.location.href =
                      `/profile/${user.userID}`
                    }
                    className="bg-slate-800 p-4 rounded-2xl cursor-pointer hover:bg-slate-700 transition-all"
                  >

                    <h3 className="text-white text-xl font-bold">
                      {user.username}
                    </h3>

                  </div>

                )
              )}

            </div>

          </div>

        )}

        {/* CREATED COMMUNITIES */}

        <div className="mb-10">

          <h2 className="text-3xl font-bold text-white mb-5">
            Communities Created
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {createdCommunities.map(
              (community) => (

                <div
                  key={
                    community.communityID
                  }
                  onClick={() =>
                    window.location.href =
                    `/community/${community.communityID}`
                  }
                  className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.02] transition-all"
                >

                  <div className="h-44">

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

                  </div>

                  <div className="p-6">

                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      {community.name}
                    </h3>

                    <p className="text-slate-300 mb-5">
                      {
                        community.description
                      }
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* JOINED COMMUNITIES */}

        <div className="mb-10">

          <h2 className="text-3xl font-bold text-white mb-5">
            Communities Joined
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {joinedCommunities.map(
              (community) => (

                <div
                  key={
                    community.communityID
                  }
                  onClick={() =>
                    window.location.href =
                    `/community/${community.communityID}`
                  }
                  className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.02] transition-all"
                >

                  <div className="h-44">

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

                  </div>

                  <div className="p-6">

                    <h3 className="text-3xl font-bold text-white mb-3">
                      {community.name}
                    </h3>

                    <p className="text-slate-300">
                      {
                        community.description
                      }
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </div>

  );

}

export default ProfilePage;