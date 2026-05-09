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
    <div>

      <h1>Register</h1>

      <input
        type="text"
        placeholder="Enter Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

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

      <button onClick={registerUser}>
        Register
      </button>

      <br /><br />

      <Link to="/">
        Already have account?
      </Link>

    </div>
  );
}

export default Register;