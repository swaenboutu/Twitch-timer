import React from 'react';
import Timer from '../timer';
import useSound from 'use-sound';
import endSound from '../assets/energy-1-107099.mp3';

export default function TimerPage({ timerDuration, onTimerEnd }) {
    const [playSound] = useSound(endSound);

    function handleTimerEnd() {
        playSound();
        if (onTimerEnd) {
            onTimerEnd();
        }
    }

    return (
        <div>
            {timerDuration && timerDuration > 0 ? (
                <Timer maxDuration={timerDuration} onEnd={handleTimerEnd} />
            ) : (
                null
            )}
        </div>
    );
} 