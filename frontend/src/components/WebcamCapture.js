import React, { useRef, useState, useEffect } from 'react';

function WebcamCapture({ onCapture, disabled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState('');

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          videoRef.current.play();
        })
        .catch(() => {
          alert("Could not access webcam. Please allow camera permissions.");
          setIsCameraOn(false);
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setCapturedImageUrl('');
      onCapture(null);
    }
    // Cleanup on unmount or camera off
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);

  const handleCaptureClick = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const imgUrl = URL.createObjectURL(blob);
        setCapturedImageUrl(imgUrl);
        onCapture(new File([blob], 'webcam_capture.png', { type: 'image/png' }));
      }
    }, 'image/png');
  };

  const handleReset = () => {
    setCapturedImageUrl('');
    onCapture(null);
  };

  return (
    <div className="webcam-capture-container">
      {!isCameraOn && (
        <button onClick={() => setIsCameraOn(true)} disabled={disabled}>
          Start Webcam
        </button>
      )}

      {isCameraOn && !capturedImageUrl && (
        <div>
          <video ref={videoRef} autoPlay playsInline muted width="320" height="240" />
          <div>
            <button onClick={handleCaptureClick} disabled={disabled}>
              Capture
            </button>
            <button onClick={() => setIsCameraOn(false)} disabled={disabled}>
              Stop Webcam
            </button>
          </div>
        </div>
      )}

      {capturedImageUrl && (
        <div>
          <img src={capturedImageUrl} alt="Captured" width="320" height="240" />
          <div>
            <button onClick={handleReset} disabled={disabled}>Retake</button>
            <button onClick={() => setIsCameraOn(false)} disabled={disabled}>Close Webcam</button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default WebcamCapture;
