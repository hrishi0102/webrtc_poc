import { useEffect, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
    setSocket(socket);
  }, []);

  async function initiateConnection() {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    //set RTC Connection
    //create offer
    const pc = new RTCPeerConnection();

    pc.onnegotiationneeded = async () => {
      const offer = await pc?.createOffer(); //sdp
      await pc?.setLocalDescription(offer);
      socket?.send(
        JSON.stringify({ type: "createOffer", sdp: pc?.localDescription })
      );
    };

    //check for ice candidate
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    //check for message
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createAnswer") {
        await pc?.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate") {
        await pc?.addIceCandidate(message.candidate);
      }
    };
  }

  return (
    <div>
      <h1>Sender</h1>
      <button onClick={initiateConnection}>Send Video</button>
    </div>
  );
};
