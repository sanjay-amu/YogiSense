import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

const PoseDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadPosenet = async () => {
      const net = await posenet.load();
      const video = videoRef.current;

      video.width = 640;
      video.height = 480;

      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        });

      const detectPose = async () => {
        const pose = await net.estimateSinglePose(video, { flipHorizontal: true });
        drawPose(pose);
        requestAnimationFrame(detectPose);
      };

      const drawPose = (pose) => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, video.width, video.height);
        ctx.drawImage(video, 0, 0, video.width, video.height);
        pose.keypoints.forEach(({ position, score }) => {
          if (score > 0.5) {
            ctx.beginPath();
            ctx.arc(position.x, position.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        });
      };

      detectPose();
    };

    loadPosenet();
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} width='640' height='480' style={{ border: '2px solid black' }} />
    </div>
  );
};

export default PoseDetection;
