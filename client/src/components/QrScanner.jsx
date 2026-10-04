import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { CameraOff, Flashlight, FlashlightOff } from 'lucide-react';
import './QrScanner.css';

export default function QrScanner({ onScan, onError, continuous = false }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const lastCodeRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [status, setStatus] = useState('starting');
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserQRCodeReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } } },
        videoRef.current,
        (result) => {
          if (cancelled || !result) return;
          const text = result.getText();

          if (continuous) {
            // Cameras redecode the same QR many times a second — ignore the same code for
            // ~3s, and any code for ~1s, so one physical scan doesn't fire repeatedly.
            const now = Date.now();
            const sameCode = text === lastCodeRef.current;
            if (now - lastTimeRef.current < (sameCode ? 3000 : 1000)) return;
            lastCodeRef.current = text;
            lastTimeRef.current = now;
            onScan(text);
            return;
          }

          controlsRef.current?.stop();
          onScan(text);
        }
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus('scanning');
        controls.isTorchAvailable?.()
          .then((available) => !cancelled && setTorchAvailable(!!available))
          .catch(() => {});
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
  }, [onScan, onError, continuous]);

  function toggleTorch() {
    const next = !torchOn;
    controlsRef.current?.switchTorch?.(next);
    setTorchOn(next);
  }

  if (status === 'unavailable') {
    return (
      <div className="qr-scanner-unavailable">
        <CameraOff size={32} className="qr-scanner-unavailable-icon" />
        <p className="qr-scanner-unavailable-text">Camera unavailable — search for the worker below instead.</p>
      </div>
    );
  }

  return (
    <div className={`qr-scanner-frame ${continuous ? 'qr-scanner-frame-fill' : ''}`}>
      <video ref={videoRef} className="qr-scanner-video" muted playsInline />
      <div className="qr-scanner-guide" />
      {status === 'starting' && (
        <p className="qr-scanner-status-text">Starting camera...</p>
      )}
      {torchAvailable && (
        <button type="button" onClick={toggleTorch} className="qr-scanner-torch-btn" aria-label="Toggle flashlight">
          {torchOn ? <FlashlightOff size={18} /> : <Flashlight size={18} />}
        </button>
      )}
    </div>
  );
}
