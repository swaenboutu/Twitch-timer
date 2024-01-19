import { useMemo, useState } from 'react';
import {channels,  rewardsId } from './consts/variables';

var timerDuration = null;
const tmi = require('tmi.js');

function ReadTwitchMessages({onTimerSet}) {
    const [isConnected, setIsConnected] = useState(false);
    const client = useMemo(() => new tmi.Client({
        channels: channels
    }), []);

    if(isConnected === false)
    {
        client.connect().catch(console.error);
        setIsConnected(true);
    }
    
    client.on('message', (channel, tags, message, self) => {
        if (self) return;
        if(tags["custom-reward-id"] !== undefined && tags["custom-reward-id"] === rewardsId.RewardCustomTimerId) {
            message = cleanMessage(message);
            if(message != null)
            {
                timerDuration  = parseInt(message, 10)*60;
                onTimerSet(timerDuration);
            }
        }
        else if(tags["username"] !== undefined && channels.includes("#"+tags["username"]) && message.includes("!timer")){
            if(message === "!timerCancel")
            {
                onTimerSet(null);
            }
            message = cleanMessage(message);
            if(message != null)
            {
                timerDuration  = parseInt(message, 10)*60;
                onTimerSet(timerDuration);
            }
        }
    }); 
}

function cleanMessage(s) {
    if(s != null){
        var numberPattern = /\d+/g;
        let numbers = s.match(numberPattern);
        if(numbers != null)
        {
            return numbers[0];
        }
        return null;
    }
    return null;
}

export {ReadTwitchMessages};