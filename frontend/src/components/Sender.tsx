import { useEffect, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
  }, []);

  async function initiateConnection() {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    //set RTC Connection
    //create offer
    setPC(new RTCPeerConnection());
    const offer = await pc?.createOffer(); //sdp
    await pc?.setLocalDescription(offer);
    socket.send(
      JSON.stringify({ type: "createOffer", sdp: pc?.localDescription })
    );

    //check for message
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createAnswer") {
        await pc?.setRemoteDescription(message.sdp);
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
