import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Timer from './timer';
import { ReadTwitchMessages } from './twitchConnection';
import { TwitchLoginButton, TwitchCallback, getStoredTwitchToken, clearStoredTwitchToken } from './TwitchAuth';
import useSound from 'use-sound';
import endSound from './assets/energy-1-107099.mp3';

export default function App() {
    const [timer, setTimer] = useState(null);
    const [playSound] = useSound(endSound);
    const [isTwitchLoggedIn, setIsTwitchLoggedIn] = useState(!!getStoredTwitchToken());

    function timerEnd(timerDuration) {
        playSound();
    }

    const handleTwitchLogout = () => {
        clearStoredTwitchToken();
        setIsTwitchLoggedIn(false);
    };

    useEffect(() => {
        const checkToken = () => setIsTwitchLoggedIn(!!getStoredTwitchToken());
        window.addEventListener('storage', checkToken);
        return () => window.removeEventListener('storage', checkToken);
    }, []);

    return (
        <div>
            <h1>Twitch Timer App</h1>

            <nav>
                {!isTwitchLoggedIn ? (
                    <TwitchLoginButton />
                ) : (
                    <div>
                        <span>Connected to Twitch!</span>
                        <button onClick={handleTwitchLogout} style={{ marginLeft: '10px' }}>Logout</button>
                        <Link to="/" style={{ marginLeft: '10px' }}>Home</Link>
                    </div>
                )}
            </nav>
            <hr />

            <Routes>
                <Route path="/" element={
                    <>
                        <ReadTwitchMessages onTimerSet={setTimer} />
                        {timer && <Timer maxDuration={timer} onEnd={timerEnd} />}
                        {!timer && <p>Waiting for timer command or reward...</p>}
                    </>
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

    return <TwitchCallback />;
}