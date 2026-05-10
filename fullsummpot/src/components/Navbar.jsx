import { useNavigate } from "react-router-dom";

import { getUserData }
  from "../utils/auth";

function Navbar() {

  const navigate = useNavigate();

  const user = getUserData();

  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");

  };

  return (

    <div className="w-full bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-4">

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">

        {/* LOGO */}

        <h1
          onClick={() => navigate("/")}
          className="text-2xl md:text-3xl font-bold text-white cursor-pointer text-center"
        >
          FullSummpot
        </h1>

        {/* BUTTONS */}

        <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">

          {/* DASHBOARD */}

          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2 rounded-lg transition-all text-sm md:text-base"
          >
            Dashboard
          </button>

          {/* LOGGED USER */}

          {user && (

            <>

              <button
                onClick={() =>
                  navigate(
                    `/profile/${user.UserID}`
                  )
                }
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-5 py-2 rounded-lg transition-all text-sm md:text-base"
              >
                Profile
              </button>

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 md:px-5 py-2 rounded-lg transition-all text-sm md:text-base"
              >
                Logout
              </button>

            </>

          )}

          {/* GUEST */}

          {!user && (

            <>

              <button
                onClick={() =>
                  navigate("/login")
                }
                className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-5 py-2 rounded-lg transition-all text-sm md:text-base"
              >
                Login
              </button>

              <button
                onClick={() =>
                  navigate("/register")
                }
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 md:px-5 py-2 rounded-lg transition-all text-sm md:text-base"
              >
                Register
              </button>

            </>

          )}

        </div>

      </div>

    </div>

  );

}

export default Navbar;