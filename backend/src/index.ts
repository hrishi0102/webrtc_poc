import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);

    //identify sender and reciever
    if (message.type === "sender") {
      senderSocket = ws;
    } else if (message.type === "receiver") {
      receiverSocket = ws;
    }

    //create offer
    else if (message.type === "createOffer") {
      if (ws !== senderSocket) {
        ws.send("You are not authorized to create offer");
        return;
      }
      receiverSocket?.send(
        JSON.stringify({ type: "createOffer", sdp: message.sdp })
      );
    }

    //create answer
    else if (message.type === "createAnswer") {
      if (ws !== receiverSocket) {
        ws.send("You are not authorized to create Answer");
        return;
      }
      senderSocket?.send(JSON.stringify({ type: "createAnswer" }));
    }

    //add ice candidate
    else if (message.type === "iceCandidate") {
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
    }
  });

  ws.send("Hello! Message From Server!!");
});
