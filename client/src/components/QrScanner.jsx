import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { CameraOff, Flashlight, FlashlightOff } from 'lucide-react';
import './QrScanner.css';

// Module-level (not per-component) so camera sessions never overlap even across React
// StrictMode's dev-only double-mount: on phones, opening a second getUserMedia session
// before the first one's tracks are fully released can hand back a dead/black stream.
// Chaining every open/close through one queue, with a short release delay, avoids that.
let cameraQueue = Promise.resolve();
function queueCameraTask(task) {
  const run = cameraQueue.then(task, task);
  cameraQueue = run.catch(() => {});
  return run;
}

export default function QrScanner({ onScan, onError, continuous = false }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const lastCodeRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [status, setStatus] = useState('starting');
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  // Keep the latest callbacks without them being effect dependencies — the parent
  // re-rendering (e.g. on every scan result) must never tear down and restart the camera.
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  onScanRef.current = onScan;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;

    queueCameraTask(async () => {
      if (cancelled) return;
      const reader = new BrowserQRCodeReader();

      let controls;
      try {
        controls = await reader.decodeFromConstraints(
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
              onScanRef.current(text);
              return;
            }

            controlsRef.current?.stop();
            onScanRef.current(text);
          }
        );
      } catch (err) {
        if (!cancelled) {
          setStatus('unavailable');
          onErrorRef.current?.(err);
        }
        return;
      }

      if (cancelled) {
        controls.stop();
        // Give the camera hardware a moment to actually release before anything else in the
        // queue (e.g. a StrictMode re-mount) tries to open it again.
        await new Promise((resolve) => setTimeout(resolve, 300));
        return;
      }

      controlsRef.current = controls;
      setStatus('scanning');
      controls.isTorchAvailable?.()
        .then((available) => !cancelled && setTorchAvailable(!!available))
        .catch(() => {});
    });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [continuous]);

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
      <video ref={videoRef} className="qr-scanner-video" muted playsInline autoPlay />
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
