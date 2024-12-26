import { useEffect } from "react";

export const Receiver = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    //check for message
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      const pc = new RTCPeerConnection();

      //receive offer and create answer
      if (message.type === "createOffer") {
        await pc?.setRemoteDescription(message.sdp);
        const answer = await pc?.createAnswer();
        await pc?.setLocalDescription(answer);
        socket.send(
          JSON.stringify({ type: "createAnswer", sdp: pc?.localDescription })
        );

        //check for ice candidate
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket?.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };
      } else if (message.type === "iceCandidate") {
        pc?.addIceCandidate(message.candidate);
      }
    };
  }, []);

  return (
    <div>
      <h1>Receiver</h1>
    </div>
  );
};
