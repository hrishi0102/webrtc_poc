import { useEffect, useState } from "react";

export const Receiver = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    //check for message
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      //receive offer and create answer
      if (message.type === "createOffer") {
        const pc = new RTCPeerConnection();
        await pc?.setRemoteDescription(message.sdp);
        const answer = await pc?.createAnswer();
        await pc?.setLocalDescription(answer);
        socket.send(
          JSON.stringify({ type: "createAnswer", sdp: pc?.localDescription })
        );
      }
    };
  }, []);

  return (
    <div>
      <h1>Receiver</h1>
    </div>
  );
};
