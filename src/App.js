import React, { useState, useEffect } from 'react';
import {channels} from './consts/variables';
import Timer from './timer';
import {ReadTwitchMessages} from './twitchConnection';
import useSound from 'use-sound'
import endSound from './assets/energy-1-107099.mp3'

export default function Main(){
  const [timer, setTimer] = useState(null);
  const [playSound] = useSound(endSound);

  function timerEnd(timerDuration){
    setTimer(timerDuration);
    playSound();
  }

  return (
      <>
        <ReadTwitchMessages channel={channels} onTimerSet={setTimer} />
        {timer != null ?
        <>
          <Timer maxDuration={timer} onEnd={timerEnd} />
        </>:null}
      </>
  );
}