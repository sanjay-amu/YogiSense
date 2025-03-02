import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

const PoseDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognition = useRef(null);

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

    const setupVoiceCommand = () => {
      if ('webkitSpeechRecognition' in window) {
        recognition.current = new webkitSpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.lang = 'en-US';

        recognition.current.onstart = () => {
          console.log('Voice recognition started');
        };

        recognition.current.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim();
          console.log('Voice Command:', transcript);
          if (transcript.toLowerCase() === 'start yoga') {
            alert('Yoga session started');
          }
        };

        recognition.current.start();
      } else {
        console.log('Speech Recognition not supported in this browser');
      }
    };

    loadPosenet();
    setupVoiceCommand();
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} width='640' height='480' style={{ border: '2px solid black' }} />
    </div>
  );
};

export default PoseDetection;
