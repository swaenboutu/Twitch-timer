import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { ReadTwitchMessages } from './twitchConnection';
import { TwitchLoginButton, TwitchCallback, getStoredTwitchToken, clearStoredTwitchToken } from './TwitchAuth';
import useSound from 'use-sound';
import endSound from './assets/energy-1-107099.mp3';
import TimerPage from './pages/TimerPage';
import ConfigPage from './pages/ConfigPage';

export default function App() {
    const [isTwitchLoggedIn, setIsTwitchLoggedIn] = useState(!!getStoredTwitchToken());
    const [timer, setTimer] = useState(null);
    const [playSound] = useSound(endSound);
    const location = useLocation();

    const handleTwitchLogout = () => {
        clearStoredTwitchToken();
        setIsTwitchLoggedIn(false);
    };

    function handleTimerEnd() {
        playSound();
        setTimer(null);
    }

    useEffect(() => {
        const checkToken = () => setIsTwitchLoggedIn(!!getStoredTwitchToken());
        window.addEventListener('storage', checkToken);
        return () => window.removeEventListener('storage', checkToken);
    }, []);

    const isTimerRoute = location.pathname === '/timer';

    return (
        <div>
            <ReadTwitchMessages onTimerSet={setTimer} />

            {!isTimerRoute && (
                <>
                    <h1>Twitch Timer App</h1>
                    <nav>
                        <Link to="/timer" style={{ marginRight: '10px' }}>Timer</Link>
                        <Link to="/config">Config</Link>
                        {isTwitchLoggedIn && (
                            <button onClick={handleTwitchLogout} style={{ marginLeft: '10px' }}>Logout</button>
                        )}
                    </nav>
                    <hr />
                </>
            )}

            <Routes>
                <Route path="/" element={<Navigate replace to="/timer" />} />

                <Route path="/timer" element={<TimerPage timerDuration={timer} onTimerEnd={handleTimerEnd} />} />

                <Route path="/config" element={
                    <ConfigPage
                        isTwitchLoggedIn={isTwitchLoggedIn}
                        handleTwitchLogout={handleTwitchLogout}
                    />
                } />

                <Route path="/twitch/callback" element={<TwitchCallbackWrapper setIsTwitchLoggedIn={setIsTwitchLoggedIn} />} />
            </Routes>
        </div>
    );
}

function TwitchCallbackWrapper({ setIsTwitchLoggedIn }) {
    useEffect(() => {
        if(getStoredTwitchToken()) {
            setIsTwitchLoggedIn(true);
        }
    }, [setIsTwitchLoggedIn]);

    return (
        <>
            <TwitchCallback />
            {getStoredTwitchToken() && <Navigate replace to="/config" />}
        </>
    );
}