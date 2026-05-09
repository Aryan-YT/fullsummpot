import { useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const logout = () => {

    localStorage.removeItem("token");

    navigate("/");

  };

  return (

    <div className="w-full bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">

      <h1 className="text-2xl font-bold text-white">
        FullSummpot
      </h1>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition-all"
      >
        Logout
      </button>

    </div>

  );

}

export default Navbar;