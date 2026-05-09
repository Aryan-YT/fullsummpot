import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function CommunityPage() {

  const { id } = useParams();

  const user = getUserData();

  const [posts, setPosts] = useState([]);

  const [community, setCommunity] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [likes, setLikes] = useState({});

  const [comments, setComments] = useState({});

  const [commentInputs, setCommentInputs] = useState({});

  // OWNER CHECK

  const isOwner =
    community &&
    parseInt(user.UserID) === community.ownerID;

  useEffect(() => {

    fetchCommunity();

    fetchPosts();

  }, [id]);

  // FETCH COMMUNITY

  const fetchCommunity = async () => {

    try {

      const response = await API.get(`/Communities/${id}`);

      setCommunity(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  // FETCH POSTS

  const fetchPosts = async () => {

    try {

      const response = await API.get(`/Posts/community/${id}`);

      setPosts(response.data);

      // FETCH LIKES + COMMENTS

      response.data.forEach((post) => {

        fetchLikes(post.postID);

        fetchComments(post.postID);

      });

    } catch (error) {

      console.log(error);

    }

  };

  // FETCH LIKES

  const fetchLikes = async (postID) => {

    try {

      const response = await API.get(`/Posts/${postID}/likes`);

      setLikes((prev) => ({

        ...prev,

        [postID]: response.data.count

      }));

    } catch (error) {

      console.log(error);

    }

  };

  // LIKE POST

  const likePost = async (postID) => {

    try {

      await API.post("/Posts/like", {

        userID: parseInt(user.UserID),
        postID: postID

      });

      fetchLikes(postID);

    } catch (error) {

      console.log(error);

    }

  };

  // FETCH COMMENTS

  const fetchComments = async (postID) => {

    try {

      const response = await API.get(`/Posts/${postID}/comments`);

      setComments((prev) => ({

        ...prev,

        [postID]: response.data

      }));

    } catch (error) {

      console.log(error);

    }

  };

  // ADD COMMENT

  const addComment = async (postID) => {

    try {

      await API.post("/Posts/comment", {

        content: commentInputs[postID],
        userID: parseInt(user.UserID),
        postID: postID

      });

      setCommentInputs((prev) => ({

        ...prev,

        [postID]: ""

      }));

      fetchComments(postID);

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
        communityID: parseInt(id)

      });

      setTitle("");
      setContent("");

      fetchPosts();

    } catch (error) {

      console.log(error);

      alert("Only community owner can post");

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">

      <Navbar />

      <div className="max-w-5xl mx-auto p-8">

        {/* COMMUNITY INFO */}

        {community && (

          <div className="mb-10">

            <h1 className="text-5xl font-bold text-white mb-3">
              {community.name}
            </h1>

            <p className="text-slate-400 text-lg">
              {community.description}
            </p>

          </div>

        )}

        {/* CREATE POST */}

        {isOwner && (

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
                placeholder="Share something..."
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

        )}

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

              <p className="text-slate-300 text-lg mb-5">
                {post.content}
              </p>

              {/* LIKE BUTTON */}

              <button
                onClick={() => likePost(post.postID)}
                className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-xl transition-all mb-5"
              >
                ❤️ {likes[post.postID] || 0} Likes
              </button>

              {/* COMMENT INPUT */}

              <div className="mb-5 space-y-3">

                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post.postID] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({

                      ...prev,

                      [post.postID]: e.target.value

                    }))
                  }
                  className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none"
                />

                <button
                  onClick={() => addComment(post.postID)}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition-all"
                >
                  Add Comment
                </button>

              </div>

              {/* COMMENTS */}

              <div className="space-y-3">

                {(comments[post.postID] || []).map((comment) => (

                  <div
                    key={comment.commentID}
                    className="bg-slate-900/60 p-4 rounded-xl border border-slate-700"
                  >

                    <p className="text-slate-200">
                      {comment.content}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default CommunityPage;