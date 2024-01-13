// import React, { useState, useEffect, useRef } from 'react';
import { rewardsId } from './consts/variables';
var timerDuration = null;

function clearTimeMessage(s){
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
    const client = new tmi.Client({
        channels: props.channel
    });
    client.connect().catch(console.error);

    client.on('message', (channel, tags, message, self) => {
        if (self) return;
        message = clearTimeMessage(message);
        if(tags["custom-reward-id"] !== undefined && tags["custom-reward-id"] === rewardsId.RewardCustomTimerId) {
            message = clearTimeMessage(message);
            if(message != null)
            {
                timerDuration  = parseInt(message, 10)*60;
                props.onTimerSet(timerDuration);
            }
        }
    }); 
}

export {ReadTwitchMessages};