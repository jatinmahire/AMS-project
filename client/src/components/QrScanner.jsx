import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { CameraOff } from 'lucide-react';
import './QrScanner.css';

export default function QrScanner({ onScan, onError }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [status, setStatus] = useState('starting');

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserQRCodeReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result, err) => {
          if (cancelled || !result) return;
          controlsRef.current?.stop();
          onScan(result.getText());
        }
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus('scanning');
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('unavailable');
        onError?.(err);
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [onScan, onError]);

  if (status === 'unavailable') {
    return (
      <div className="qr-scanner-unavailable">
        <CameraOff size={32} className="qr-scanner-unavailable-icon" />
        <p className="qr-scanner-unavailable-text">Camera unavailable — search for the worker below instead.</p>
      </div>
    );
  }

  return (
    <div className="qr-scanner-frame">
      <video ref={videoRef} className="qr-scanner-video" muted playsInline />
      <div className="qr-scanner-guide" />
      {status === 'starting' && (
        <p className="qr-scanner-status-text">Starting camera...</p>
      )}
    </div>
  );
}
