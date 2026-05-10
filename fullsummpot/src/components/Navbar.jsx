import { useNavigate } from "react-router-dom";

import { getUserData }
  from "../utils/auth";

function Navbar() {

  const navigate = useNavigate();

  const user = getUserData();

  const logout = () => {

    localStorage.removeItem("token");

    navigate("/login");

  };

  return (

    <div className="w-full bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">

      {/* LOGO */}

      <h1
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-white cursor-pointer"
      >
        FullSummpot
      </h1>

      {/* BUTTONS */}

      <div className="flex gap-4">

        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all"
        >
          Dashboard
        </button>

        {/* ONLY IF LOGGED IN */}

        {user && (

          <>

            <button
              onClick={() =>
                navigate(
                  `/profile/${user.UserID}`
                )
              }
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition-all"
            >
              Profile
            </button>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition-all"
            >
              Logout
            </button>

          </>

        )}

        {/* GUEST BUTTONS */}

        {!user && (

          <>

            <button
              onClick={() =>
                navigate("/login")
              }
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-all"
            >
              Login
            </button>

            <button
              onClick={() =>
                navigate("/register")
              }
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-lg transition-all"
            >
              Register
            </button>

          </>

        )}

      </div>

    </div>

  );

}

export default Navbar;