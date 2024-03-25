import React, { useState } from 'react';
import Timer from './timer';
import {ReadTwitchMessages} from './twitchConnection';
import useSound from 'use-sound'
import endSound from './assets/energy-1-107099.mp3'

export default function Main(){
  const [timer, setTimer] = useState(null);
  const [playSound] = useSound(endSound);

  function timerEnd(timerDuration){
    playSound();
  }

  return (
      <>
        <ReadTwitchMessages onTimerSet={setTimer} />
        {timer && <Timer maxDuration={timer} onEnd={timerEnd} /> }
      </>
  );
}