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

      alert("Login Successful");

      navigate("/dashboard");

    } catch (error) {

      alert("Invalid Credentials");

      console.log(error);

    }

  };

  return (
    <div>

      <h1>Login</h1>

      <input
        type="email"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Enter Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={loginUser}>
        Login
      </button>

      <br /><br />

      <Link to="/register">
        Create Account
      </Link>

    </div>
  );
}

export default Login;