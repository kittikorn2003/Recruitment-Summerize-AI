import { use, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Login from '../src/pages/Login'
import Register from '../src/pages/Register'
import Page from '../src/pages/Page'
import Navbar from './components/Navbar'
import Upload from './pages/Upload'
import ResumeForm from './pages/ResumeForm'
import UploadProfile from './pages/UploadProfile'
import Landingpage from '../src/pages/Landingpage'
import RoleRequest from "./pages/RoleRequest";
import AdminRoleRequests from "./pages/AdminRoleRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import { Route, Routes, useNavigate } from 'react-router-dom'
import axios from 'axios'

function App() {
  const navigate = useNavigate();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploadProfileOpen, setIsUploadProfileOpen] = useState (false);
  const [user, setUser] = useState(null);
  const [isResumeFormOpen, setIsResumeFormOpen] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [getData, setGetData] = useState([]);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({
    q: "",
    languages: [],
    experience: [],
  })
  // const isLandingPage = location.pathname === '/';

  // console.log("For results",results);
  // console.log("For getData",getData);


  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if(!token) return;
    
    try {
      const response = await axios.get('http://localhost:3000/api/users/me', {
        headers: { 
          Authorization : `Bearer ${token}`
        }
      })
      setUser(response.data);
    }catch {
      localStorage.removeItem('token');
      setUser(null)
    }
  };

  const fetchResumeData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get("http://localhost:3000/api/resume",{
        headers: { 
          Authorization : `Bearer ${token}`
        }
      }
      ) 
      setGetData(response.data);
    }catch(err){
      console.error("Fetch Get Data Error",err);
    }
  }

  const searchResume = async () => {
    try {
      const params = new URLSearchParams();
      
      if (searchParams.q.trim()) {
        params.append("q", searchParams.q);
      }

      if (searchParams.languages.length) {
        params.append(
          "languages",
          searchParams.languages.join(",")
        )
      }
      
      if (searchParams.experience.length) {
        params.append (
          "experience",
          searchParams.experience.join(",")
        )
      }
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:3000/api/resumes/search?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      setResults(response.data.data);
    } catch (err) {
      console.error(err);
    }
  }
  useEffect (() => {
    fetchUserData();
    fetchResumeData();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  return (
    <div className='App'>
      <Navbar
        onSignInClick={() => setIsSignInOpen(true)}
        onSignUpClick={() => setIsSignUpOpen(true)}
        onUploadClick={() => setIsUploadOpen(true)}
        onUploadProfileClick={() => setIsUploadProfileOpen(true)}
        user={user}
        onLogout={handleLogout}
      />
      {isSignInOpen && 
        (<Login 
          onClose={() => setIsSignInOpen(false)}
          onLoginSuccess={(userData) => {
            setUser(userData);
          }}
          onSwitchToSingUp={() =>{
            setIsSignInOpen(false);
            setIsSignUpOpen(true);
          }}
        />
      )}
      {isSignUpOpen &&
        (<Register
          onClose={() => setIsSignUpOpen(false)}
          onSwitchToSignIn={() =>{
            setIsSignInOpen(true)
            setIsSignUpOpen(false)
          }}
        />
      )}
      {isUploadOpen &&
      (<Upload
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(data) =>{
          setResumeData(data)
          setIsUploadOpen(false)
          setIsResumeFormOpen(true)
          fetchResumeData()
        }}
        />)

      }
      {isUploadProfileOpen &&
      (<UploadProfile
        onClose={() => setIsUploadProfileOpen(false)}
        onSaveSuccess={() => {
          // fetchResumeData();
          fetchUserData();
        }}
       />
      )
      }

      {isResumeFormOpen &&
      (<ResumeForm
      onClose={() => setIsResumeFormOpen(false)}
      initialData={resumeData}
      onSaveSuccess={fetchResumeData}
      />)
      }
      <Routes>
        <Route path="/" element={<Landingpage onGetStarted={() => navigate("/search")} />} />
        <Route path="/search" element={
          <Page
            results={results}
            hasSearched={hasSearched}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            searchResume={searchResume}
          />
        }/>
        <Route path="/role-request" element={<RoleRequest />} />
        <Route path="/admin/role-requests" element={<AdminRoleRequests />} />
      </Routes>
      <main>
      </main>
    </div>
  )
}

export default App
