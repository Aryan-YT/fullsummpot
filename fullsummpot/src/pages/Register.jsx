import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async () => {

    try {

      await API.post("/Auth/register", {
        username,
        email,
        passwordHash: password,
        role: "User"
      });

      alert("Registration Successful");

      navigate("/");

    } catch (error) {

      alert("Registration Failed");

      console.log(error);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        <p className="text-slate-300 text-center mb-8">
          Join Full Summpot
        </p>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Enter Username"
            className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none focus:border-blue-500"
            onChange={(e) => setUsername(e.target.value)}
          />

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
            onClick={registerUser}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold py-4 rounded-xl"
          >
            Register
          </button>

        </div>

        <p className="text-slate-300 text-center mt-6">

          Already have an account?

          <Link
            to="/"
            className="text-blue-400 ml-2 hover:text-blue-300"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  );

}

export default Register;