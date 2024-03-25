import React, { useState, useEffect, useRef, useCallback } from 'react';


function Timer (props) {
    const Ref = useRef(null);
    // The state for our timer  
    const [timer, setTimer] = useState();
    const [maxDuration] = useState(parseInt(props.maxDuration));
    const [strokeDasharray, setStrokeDasharray] = useState(0);
    const [timerClassName, setTimerClassName] = useState("pulse")
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeOffset = (1 / 4) * circumference;

    const clearTimer = useCallback((e) => {
        // If you adjust it you should also need to
        // adjust the Endtime formula we are about
        // to code next
        const initMinutes = Math.floor( maxDuration / 60);
        const initSeconds = (maxDuration-initMinutes*60);

        setTimer(initMinutes.toString().padStart(2, '0')+":"+initSeconds.toString().padStart(2, '0'));
        setStrokeDasharray(0);

        // If you try to remove this line the
        // updating of timer Variable will be
        // after 1000ms or 1sec
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer(e);
        }, 1000);
        Ref.current = id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getTimeRemaining (e) {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        return {
            total, minutes, seconds
        };
    }

    function startTimer(e) {
        let { total, minutes, seconds }
                    = getTimeRemaining(e);
        if (total >= 0) {
            setStrokeDasharray(((Math.floor(total / 1000) * 360 / maxDuration) / 360) * circumference);

            // update the timer
            // check if less than 10 then we need to
            // add '0' at the beginning of the variable
            setTimer(
                (minutes > 9 ? minutes : '0' + minutes) + ':'
                + (seconds > 9 ? seconds : '0' + seconds)
            );
            if(total/1000 < 30)
                setTimerClassName("shake");

            if(total/1000 <= 10)
                setTimerClassName("mega-shake");

        } else {
            // If we are done
            // Clear the timer
            clearInterval(Ref.current);

            // add the animation
            setTimerClassName("too-late");

            // and execute the callback function
            props.onEnd();
        }
    }

    function getDeadTime(t) {
        let deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + parseInt(t));
        return deadline;
    }

    useEffect(() => {
        clearTimer(getDeadTime(maxDuration));
    }, [clearTimer, maxDuration]);

    // strokeDasharray : two values, the first sets the dash and the second sets the gap
    return (
        <div className="timer almost-end">
            <div id="timer-text" className={timerClassName}>{timer}</div>
            <span>
                <svg width={900} height={900} viewBox='-20 -10 150 150'>
                    {<circle id="timer-rotating-border" cx={55} cy={65} r={radius} fill="transparent" strokeWidth={10} />}
                    {<circle id="timer-border" cx={55} cy={65} r={radius} fill="transparent"  strokeWidth={10} strokeDasharray={[circumference - strokeDasharray, strokeDasharray]} strokeDashoffset={strokeOffset} />}
                    {<circle id="timer-background" cx={55} cy={65} r={radius} />}
                    <circle id="timer-rotating-dot" r={10} cx={55} cy={13} />
                    <animateTransform href='#timer-rotating-dot' attributeName="transform" type='rotate' from={"0 55 65"} to={"360  55 65"} dur={maxDuration.toString()+"s"} repeatCount="1" restart="always"/>
                </svg>
            </span>
        </div>
    )
}

export default Timer;