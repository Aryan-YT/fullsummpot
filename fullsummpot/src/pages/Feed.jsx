import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function Feed() {

  const user = getUserData();

  const [posts, setPosts] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {

    fetchPosts();

  }, []);

  // FETCH POSTS

  const fetchPosts = async () => {

    try {

      const response = await API.get("/Posts");

      setPosts(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  // CREATE POST

  const createPost = async () => {

    try {

      await API.post("/Posts", {

        title,
        content,
        userID: parseInt(user.UserID),
        communityID: 1

      });

      setTitle("");
      setContent("");

      fetchPosts();

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">

      <Navbar />

      <div className="max-w-4xl mx-auto p-8">

        <div className="mb-10">

          <h1 className="text-5xl font-bold text-white mb-3">
            Community Feed 🔥
          </h1>

          <p className="text-slate-400 text-lg">
            Share thoughts with the community.
          </p>

        </div>

        {/* CREATE POST */}

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl mb-10">

          <h2 className="text-2xl text-white font-bold mb-5">
            Create Post
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none"
            />

            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none"
            />

            <button
              onClick={createPost}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              Post
            </button>

          </div>

        </div>

        {/* POSTS */}

        <div className="space-y-6">

          {posts.map((post) => (

            <div
              key={post.postID}
              className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl"
            >

              <h2 className="text-2xl font-bold text-white mb-3">
                {post.title}
              </h2>

              <p className="text-slate-300 text-lg">
                {post.content}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default Feed;