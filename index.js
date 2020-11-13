import Websocket from "https://cdn.skypack.dev/reconnecting-websocket";
import p5 from "https://cdn.skypack.dev/p5";

const url = "wss://ws-fggq5.ondigitalocean.app";
const socket = new Websocket(url);

// Replace with your personal channelname for testing
// Maps to https://elektron.love/residence

const channel = "residence";

const userId = "agdtaafwusyruatr";
const userName = "p5 user";

const sketch = (s) => {
  // p5 image that we will get from elektron.live
  let image = null;

  s.setup = () => {
    // Set up a canvas

    s.createCanvas(400, 400);

    // Listen to websocket messages

    socket.addEventListener("message", ({ data }) => {
      const message = safeJsonParse(data);

      // Comment the following line out if you want to see all the messages
      // elektron.live is sending out

      // console.log(message)

      // We are looking for IMAGE message to get the audience image frames
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
    s.background(255);
    if (image) {
      s.image(image, 0, 0);
    }
  };

  // On mouse press we send the processed image back to elektron.live

  s.mousePressed = () => {
    image.loadPixels();
    socket.send(
      createMessage({
        userId,
        userName,
        channel,
        type: "IMAGE",
        value: image.canvas.toDataURL(),
      })
    );
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

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return null;
  }
}
