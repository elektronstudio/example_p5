// To run the example, visit https://elektron.live/residence
// and turn on your camera

import Websocket from "https://cdn.skypack.dev/reconnecting-websocket";
import p5 from "https://cdn.skypack.dev/p5";

const url = "wss://ws-fggq5.ondigitalocean.app";
const socket = new Websocket(url);

// Replace with your personal channelname for testing
// Will be connected to https://elektron.live/residence

const channel = "residence";

// User ID and name will be used when posting
// messages to elektron.live. You can use existing
// user credentials or come up with a new ones

const userId = "agdtaafwusyruatr";
const userName = "p5 user";

// We are using p5 "instance mode" for easier integration with other libraries
// https://github.com/processing/p5.js/wiki/Global-and-instance-mode

const sketch = (s) => {
  // p5 image that we will get from elektron.live

  let image = null;

  s.setup = () => {
    // Set up a canvas

    s.createCanvas(400, 400);

    // Listen to websocket messages

    socket.addEventListener("message", ({ data }) => {
      // Parse websocket message

      const message = safeJsonParse(data);

      // Comment the following line out if you want to see all the messages
      // elektron.live is sending out

      // console.log(message)

      // We are looking for IMAGE message to get the audience image frames
      // By default we are receiving images from all users. If you want
      // to get the image of particular user, add the condition
      //
      // && message.userName === 'username-you-want'

      if (message && message.type === "IMAGE" && message.channel === channel) {
        // Get the encoded image from the Websocket message
        // and create a p5 image out of it
        const rawImage = new Image();
        rawImage.src = message.value;
        rawImage.onload = () => {
          image = s.createImage(rawImage.width, rawImage.height);
          image.drawingContext.drawImage(rawImage, 0, 0);
          // Let's apply the filter to the image
          image.filter(s.INVERT);
        };
      }
    });
  };

  s.draw = () => {
    // Set t
    s.background(230);
    if (image) {
      s.image(image, 0, 0);
    }
  };

  // On mouse press we send the processed image back to elektron.live

  s.mousePressed = () => {
    image.loadPixels();

    // Send the image

    socket.send(
      createMessage({
        userId,
        userName,
        channel,
        type: "IMAGE",
        value: image.canvas.toDataURL(),
      })
    );

    // Send the chat message

    socket.send(
      createMessage({
        userId,
        userName,
        channel,
        type: "CHAT",
        value: "A new audience image is posted",
      })
    );
  };
};

// Assign the sketch to the DOM element <div id="sketch"></div>

new p5(sketch, document.getElementById("sketch"));

// Helper functions

const createMessage = (message) => {
  const id = "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .sort(() => Math.random() - 0.5)
    .slice(0, 16)
    .join("");
  return JSON.stringify({
    id,
    datetime: new Date().toISOString(),
    type: "",
    channel: "",
    userId: "",
    userName: "",
    value: "",
    ...message,
  });
};

const safeJsonParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return null;
  }
};
