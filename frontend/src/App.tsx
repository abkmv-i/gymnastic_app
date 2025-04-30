// App.tsx (основной роутинг)
import React from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompetitionDetails from './pages/CompetitionDetails';
import CompetitionJudging from './pages/CompetitionJudging';
import CompetitionResults from './pages/CompetitionResults';
import GymnastsPage from './pages/GymnastsPage';
import JudgesPage from './pages/JudgesPage';
import StreamsPage from './pages/StreamsPage';
import CompetitionCreate from './pages/CompetitionCreate';
import CompetitionEdit from './pages/CompetitionEdit';
import NotFoundPage from './pages/NotFoundPage';
import {useAuth} from './context/AuthContext';
import './App.css';


const Navigation: React.FC = () => {
    const {user, logout} = useAuth();

    return (
        <nav className="main-nav">
            <div className="nav-container">
                <Link to="/" className="nav-logo">Гимнастика</Link>

                <div className="nav-links">
                    {user && (
                        <>
                            <Link to="/" className="nav-link">Главная</Link>
                            <Link to="/gymnasts" className="nav-link">Гимнастки</Link>
                            <Link to="/judges" className="nav-link">Судьи</Link>

                            {user.role === 'admin' && (
                                <Link to="/competitions/new" className="nav-link">Создать соревнование</Link>
                            )}
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
                            <Link to="/login" className="nav-link">Вход</Link>
                            <Link to="/register" className="nav-link">Регистрация</Link>
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
                        <Route path="competitions/:id/results" element={<CompetitionResults/>}/>
                        <Route path="competitions/:id/streams" element={<StreamsPage/>}/>
                        <Route path="gymnasts" element={<GymnastsPage/>}/>
                        <Route path="judges" element={<JudgesPage/>}/>

                    </Route>

                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </div>
        </AuthProvider>
    );
};

export default App;