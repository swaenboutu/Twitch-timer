import { rewardsId } from './consts/variables';
import { useState, useEffect } from 'react';

var timerDuration = null;

function cleanMessage(s){
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

function ReadTwitchMessages(props) {
    const tmi = require('tmi.js');
    const [connected, setConnected] = useState(false);

    const client = new tmi.Client({
        channels: props.channels
    });

    if(connected === false)
    {
        client.connect().catch(console.error);
        setConnected(true);
    }
    
    client.on('message', (channel, tags, message, self) => {
        if (self) return;
        if(tags["custom-reward-id"] !== undefined && tags["custom-reward-id"] === rewardsId.RewardCustomTimerId) {
            message = cleanMessage(message);
            if(message != null)
            {
                timerDuration  = parseInt(message, 10)*60;
                props.onTimerSet(timerDuration);
            }
        }
        else if(tags["username"] !== undefined && props.channels.includes("#"+tags["username"]) && message.includes("!timer")){
            if(message === "!timerCancel")
            {
                props.onTimerSet(null);
            }
            message = cleanMessage(message);
            if(message != null)
            {
                timerDuration  = parseInt(message, 10)*60;
                props.onTimerSet(timerDuration);
            }
        }
    }); 
}

export {ReadTwitchMessages};