import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);

    switch (message.type) {
      //identify the sender and receiver
      case "sender":
        senderSocket = ws;
        console.log("Sender Connected");
        break;

      case "receiver":
        receiverSocket = ws;
        console.log("Receiver Connected");
        break;

      //create offer and answer
      case "createOffer":
        if (ws !== senderSocket) {
          ws.send("You are not authorized to create offer");
          return;
        }
        receiverSocket?.send(
          JSON.stringify({ type: "createOffer", sdp: message.sdp })
        );
        console.log("Offer Sent");
        break;

      case "createAnswer":
        if (ws !== receiverSocket) {
          ws.send("You are not authorized to create Answer");
          return;
        }
        senderSocket?.send(
          JSON.stringify({ type: "createAnswer", sdp: message.sdp })
        );
        console.log("Answer Sent");
        break;

      //send ice candidate
      case "iceCandidate":
        if (ws === senderSocket) {
          receiverSocket?.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: message.candidate,
            })
          );
        } else if (ws === receiverSocket) {
          senderSocket?.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: message.candidate,
            })
          );
        }
        break;

      default:
        // Handle any unrecognized message types
        console.warn(`Unhandled message type: ${message.type}`);
        break;
    }
  });

  ws.send("Hello! Message From Server!!");
});
