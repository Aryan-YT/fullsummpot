import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {

    try {

      const response = await API.post("/Auth/login", {
        email,
        password
      });

      localStorage.setItem("token", response.data.token);

      navigate("/dashboard");

    } catch (error) {

      alert("Invalid Credentials");

      console.log(error);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-slate-300 text-center mb-8">
          Login to continue
        </p>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Enter Email"
            className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none focus:border-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none focus:border-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={loginUser}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold py-4 rounded-xl"
          >
            Login
          </button>

        </div>

        <p className="text-slate-300 text-center mt-6">

          Don't have an account?

          <Link
            to="/register"
            className="text-blue-400 ml-2 hover:text-blue-300"
          >
            Register
          </Link>

        </p>

      </div>

    </div>

  );

}

export default Login;