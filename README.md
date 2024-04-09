# Twitch-timer

This project is a timer created for my Twitch channel [http://twitch.tv/swaenlive](http://twitch.tv/swaenlive). The goal is for viewers to be able to display a timer on the screen.
This project is openSource and free to use, if you're doing so please notify me so I can brag :D

# How it works

## viewer side

On the viewer side, the only thing to do is to use a custom reward and add the number of minutes to set for the duration of the time

## streamer side

On the streamer side, you should include a **compiled version** of this project as a "*Brower source*" in your streaming software (such as OBS or streamElements). 

*Note*: don't forget to click "Refresh browser when scene becomes active".

As streamer, you can use a chat message to display `!timer XX` and hide the timer `!timerCancel`.

*Note* : In order to hide reset the timer, you can also hide and display again the browser source as it refresh everytime the scene become active.

But befor you do so, here are the few things you have to set :
* The `channels` in `varibles.js` file must contains the name of the Twitch channels you want to use this project on
* The `rewardsId` in `variables.js` is the UUID of the custom reward you've created for the timer (here is the way to get it : [https://dev.twitch.tv/docs/api/reference/#get-custom-reward](https://dev.twitch.tv/docs/api/reference/#get-custom-reward))


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)