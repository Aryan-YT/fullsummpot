import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function CommunityPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const user = getUserData();

  const [posts, setPosts] = useState([]);

  const [community, setCommunity] = useState(null);

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [image, setImage] = useState(null);

  const [likes, setLikes] = useState({});

  const [comments, setComments] = useState({});

  const [commentInputs, setCommentInputs] = useState({});

  const [editingPostID, setEditingPostID] = useState(null);

  const [editTitle, setEditTitle] = useState("");

  const [editContent, setEditContent] = useState("");

  // OWNER CHECK

  const isOwner =
    user &&
    community &&
    parseInt(user.UserID) === community.ownerID;

  useEffect(() => {

    fetchCommunity();

    fetchPosts();

  }, [id]);

  // CLICKABLE LINKS

  const renderWithLinks = (text) => {

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {

      if (part.match(urlRegex)) {

        return (

          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline break-all"
          >
            {part}
          </a>

        );

      }

      return part;

    });

  };

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

    if (!user) {

      requireLogin();

      return;

    }

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

    if (!user) {

      requireLogin();

      return;

    }

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

  const requireLogin = () => {

    alert(
      "Please login or register first."
    );

    navigate("/login");

  };

  const createPost = async () => {

    if (!user) {

      requireLogin();

      return;

    }

    try {

      const formData = new FormData();

      formData.append("title", title);

      formData.append("content", content);

      formData.append("userID", parseInt(user.UserID));

      formData.append("communityID", parseInt(id));

      if (image) {

        formData.append("image", image);

      }

      await API.post("/Posts", formData, {

        headers: {

          "Content-Type": "multipart/form-data"

        }

      });

      setTitle("");

      setContent("");

      setImage(null);

      fetchPosts();

    } catch (error) {

      console.log(error);

      alert("Only community owner can post");

    }

  };

  // DELETE POST

  const deletePost = async (postID) => {

    if (!user) {

      requireLogin();

      return;

    }

    try {

      await API.delete(`/Posts/${postID}`);

      fetchPosts();

    } catch (error) {

      console.log(error);

    }

  };

  // START EDIT

  const startEdit = (post) => {

    setEditingPostID(post.postID);

    setEditTitle(post.title);

    setEditContent(post.content);

  };

  // SAVE EDIT

  const saveEdit = async (postID) => {

    if (!user) {

      requireLogin();

      return;

    }

    try {

      await API.put(`/Posts/${postID}`, {

        title: editTitle,

        content: editContent

      });

      setEditingPostID(null);

      fetchPosts();

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">

      <Navbar />

      <div className="max-w-5xl mx-auto p-4 md:p-8">

        {/* COMMUNITY INFO */}

        {/* COMMUNITY HERO */}

        {community && (

          <div className="relative mb-12 rounded-3xl md:rounded-[35px] overflow-hidden border border-white/10 shadow-2xl">

            {/* BANNER */}

            <div className="h-[250px] md:h-[350px] relative">

              {community.bannerUrl ? (

                <img
                  src={community.bannerUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />

              ) : (

                <div className="w-full h-full bg-slate-800" />

              )}

              {/* OVERLAY */}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              {/* CONTENT */}

              <div className="absolute bottom-0 left-0 w-full p-4 md:p-10">

                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">

                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white text-4xl font-bold">

                    {community.name?.charAt(0)}

                  </div>

                  <div>

                    <h1 className="text-3xl md:text-6xl font-black text-white mb-2 tracking-tight text-center md:text-left">

                      {community.name}

                    </h1>

                    <p className="text-slate-300 text-sm md:text-lg text-center md:text-left">

                      {community.description}

                    </p>

                  </div>

                </div>

                {/* STATS */}

                <div className="flex gap-4 mt-6 flex-wrap">

                  <div className="bg-white/10 backdrop-blur-lg px-5 py-3 rounded-2xl border border-white/10">

                    <p className="text-slate-300 text-sm">
                      Posts
                    </p>

                    <h2 className="text-white text-2xl font-bold">
                      {posts.length}
                    </h2>

                  </div>

                  <div className="bg-white/10 backdrop-blur-lg px-5 py-3 rounded-2xl border border-white/10">

                    <p className="text-slate-300 text-sm">
                      Community ID
                    </p>

                    <h2 className="text-white text-2xl font-bold">
                      #{community.communityID}
                    </h2>

                  </div>

                  {isOwner && (

                    <div className="bg-yellow-500 text-black px-5 py-3 rounded-2xl font-bold flex items-center">

                      👑 You Own This Community

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        )}

        {/* CREATE POST */}

        {isOwner && (

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl mb-10">

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

              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="text-white"
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
              className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl"
            >

              {/* PROFILE */}

              <div className="flex items-center gap-3 mb-5 flex-wrap">

                {post.profileImageUrl ? (

                  <img
                    src={post.profileImageUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border border-slate-600 cursor-pointer"
                    onClick={() =>
                      navigate(`/profile/${post.userID}`)
                    }
                  />

                ) : (

                  <div
                    onClick={() =>
                      navigate(`/profile/${post.userID}`)
                    }
                    className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold cursor-pointer"
                  >
                    {post.username?.charAt(0)}
                  </div>

                )}

                <div>

                  <p
                    onClick={() =>
                      navigate(`/profile/${post.userID}`)
                    }
                    className="text-white font-bold cursor-pointer"
                  >
                    {post.username}
                  </p>

                </div>

              </div>

              {/* TITLE */}

              {editingPostID === post.postID ? (

                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none mb-3"
                />

              ) : (

                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                  {post.title}
                </h2>

              )}

              {/* CONTENT */}

              {editingPostID === post.postID ? (

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none mb-5"
                />

              ) : (

                <p className="text-slate-300 text-base md:text-lg mb-5 break-words">
                  {renderWithLinks(post.content)}
                </p>

              )}

              {/* IMAGE */}

              {post.imageUrl && (

                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full rounded-2xl mb-5"
                />

              )}

              {/* EDIT DELETE */}

              {isOwner && (

                <div className="flex flex-wrap gap-3 mb-5">

                  {editingPostID === post.postID ? (

                    <button
                      onClick={() => saveEdit(post.postID)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-xl transition-all"
                    >
                      Save
                    </button>

                  ) : (

                    <button
                      onClick={() => startEdit(post)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-xl transition-all"
                    >
                      Edit
                    </button>

                  )}

                  <button
                    onClick={() => deletePost(post.postID)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition-all"
                  >
                    Delete
                  </button>

                </div>

              )}

              {/* LIKE */}

              <button
                onClick={() => likePost(post.postID)}
                className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-xl transition-all mb-5"
              >
                ❤️ {likes[post.postID] || 0} Likes
              </button>

              {/* COMMENT INPUT */}

              <div className="mb-5 space-y-3 w-full">

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
                      {renderWithLinks(comment.content)}
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