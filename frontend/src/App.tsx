// App.tsx (основной роутинг)
import React from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';
import HomePage from './pages/Common/HomePage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Login/RegisterPage';
import CompetitionDetails from './pages/Competition/CompetitionDetails';
import CompetitionJudging from './pages/Judging/CompetitionJudging';
import CompetitionCreate from './pages/Competition/CompetitionCreate';
import CompetitionEdit from './pages/Competition/CompetitionEdit';
import NotFoundPage from './pages/Common/NotFoundPage';
import {useAuth} from './context/AuthContext';
import './App.css';
import { ReactComponent as Logo } from './images/logo.svg'; 


const Navigation: React.FC = () => {
    const {user, logout} = useAuth();

    return (
        <nav className="main-nav">
            <div className="nav-container">
                {user ? (
                        <>
                            <Link to="/" className="nav-logo">
                                <Logo style={{ height: 50, width: 100 }} />
                            </Link>
                        </>
                    ) : (
                        <>
                           <Link to="/" className="nav-logo">
                                <Logo style={{ height: 50, width: 1200 }} />
                            </Link>
                        </>
                    )}
                

                <div className="nav-links">
                     {user && (
                        <> 
                            <Link to="/" className="nav-link">Соревнования</Link>

                           
                         </>
                    )} 
                </div>

                <div className="nav-auth">
                    {user ? (
                        <>
                            <button onClick={logout} className="nav-logout">Выйти</button>
                        </>
                    ) : (
                        <>
                            {/* <Link to="/login" className="nav-link">Вход</Link>
                            <Link to="/register" className="nav-link">Регистрация</Link> */}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <Navigation/>
            <div className="content-container">
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>

                    <Route path="/" element={<PrivateRoute/>}>
                        <Route index element={<HomePage/>}/>
                        <Route path="competitions/new" element={<CompetitionCreate/>}/>
                        <Route path="competitions/:id" element={<CompetitionDetails/>}/>
                        <Route path="competitions/:id/edit" element={<CompetitionEdit/>}/>
                        <Route path="competitions/:id/judge" element={<CompetitionJudging/>}/>

                    </Route>

                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </div>
        </AuthProvider>
    );
};

export default App;