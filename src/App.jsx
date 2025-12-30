// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Sidebar from './components/Sidebar';
// import Home from './pages/Home';
// import MapAnalytics from './pages/MapAnalytics';
// import Simulator from './pages/Simulator';
// import AddLot from './pages/AddLot';
// import LocationLayout from './pages/LocationLayout';
// import LocationOverview from './pages/LocationOverview';
// import LocationGeneric from './pages/LocationGeneric';

// const App = () => {
//   return (
//     <Router>
//       <div className="flex h-screen bg-neutral-200 font-sans text-neutral-800 overflow-hidden">
//         <Sidebar />

//         {/* Main Content Area */}
//         <div className="flex-1 flex flex-col min-w-0 bg-neutral-200 transition-all duration-300 overflow-hidden">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/map" element={<MapAnalytics />} />
//             <Route path="/simulator" element={<Simulator />} />
//             <Route path="/add-lot" element={<AddLot />} />
//             {/* Location Routes */}
//             <Route path="/location/:slug" element={<LocationLayout />}>
//               <Route path="overview" element={<LocationOverview />} />
//               <Route path="alerts" element={<LocationGeneric title="Alerts" />} />
//               <Route path="payments" element={<LocationGeneric title="Payments" />} />
//               <Route path="parked-cars" element={<LocationGeneric title="Parked Cars" />} />
//               <Route path="history" element={<LocationGeneric title="History" />} />
//               <Route path="sensors" element={<LocationGeneric title="Sensors" />} />
//               <Route path="config" element={<LocationGeneric title="Config" />} />
//               <Route path="export" element={<LocationGeneric title="Export" />} />
//               <Route path="contractor" element={<LocationGeneric title="Contractor" />} />
//             </Route>
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// };

// export default App;
import React from 'react';
import { Home, BookOpen, Users, Settings, Calendar, BarChart, LogOut } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import VideoBackground from "./VideoBackground.jsx";
import PageTransition from "./components/PageTransition.jsx";
import Login from './components/Login';
import Verify from './components/Verify';
import Forgot from './components/Forgot';

import DashboardHome from './pages/Home';
import MapAnalytics from './pages/MapAnalytics';
import Simulator from './pages/Simulator';
// import AddLot from './pages/AddLot'; // Removed
import WardLayout from './pages/WardLayout';
import WardGeneric from './pages/WardGeneric';
import WardMapAnalytics from './pages/WardMapAnalytics';
import ManageWards from './pages/ManageWards';
import Playground from './pages/Playground';

import { useAuth } from './context/AuthContext.jsx';

function App() {
  const { isLoggedIn, setIsLoggedIn, setEmail, email, setUsername, loading, setRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-nord-6">
        <div className="text-nord-0">Loading...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "Delete",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        navigate("/");

        setUsername("");
        setIsLoggedIn(false);
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  return (


    <div className="flex min-h-screen bg-nord-6 text-nord-0 font-sans">

      {isLoggedIn ? (
        <>

          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 ">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>

                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<PageTransition><DashboardHome /></PageTransition>} />
                <Route path="/map" element={<PageTransition><MapAnalytics /></PageTransition>} />


                {/* Ward Routes */}
                <Route path="/ward/:wardSlug" element={<PageTransition><WardLayout /></PageTransition>}>
                  <Route path="overview" element={<PageTransition><WardGeneric title="Overview" /></PageTransition>} />
                  <Route path="decision-support" element={<PageTransition><WardMapAnalytics /></PageTransition>} />
                  <Route path="simulator" element={<PageTransition><Simulator /></PageTransition>} />
                  <Route path="external-contributors" element={<PageTransition><WardGeneric title="External Contributors" /></PageTransition>} />
                  <Route path="sensor-management" element={<PageTransition><WardGeneric title="Sensor Management" /></PageTransition>} />
                  <Route path="public-release" element={<PageTransition><WardGeneric title="Public Release" /></PageTransition>} />
                  <Route path="export-report" element={<PageTransition><WardGeneric title="Export PDF Report" /></PageTransition>} />
                  <Route path="meta-data" element={<PageTransition><WardGeneric title="Meta Data" /></PageTransition>} />
                </Route>


                <Route path="/manage-wards" element={<PageTransition><ManageWards /></PageTransition>} />
                <Route path="/playground" element={<PageTransition><Playground /></PageTransition>} />

              </Routes>
            </AnimatePresence>
          </main>
        </>

      ) : (


        <>
          <VideoBackground>
            <Routes>
              <Route
                path="/"
                element={<Login onLog={(username, role) => { setIsLoggedIn(true); setUsername(username); setRole(role); }} />}
              />

              <Route
                path="/otp"
                element={<Verify onLoginSuccess={(email) => {
                  setIsLoggedIn(true);
                  setEmail(email);
                }} />}
              />

              <Route
                path="/forgot"
                element={<Forgot onLoginSuccess={(email, username) => {
                  setEmail(email);
                  setUsername(username);
                  setIsLoggedIn(true);
                }} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </VideoBackground>
        </>

      )}

    </div>


  );
}

export default App;
