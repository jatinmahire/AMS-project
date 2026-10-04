import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import Button from './Button';
import { printNow } from '../utils/printExport';
import './WorkerQrCard.css';

// QR payload is always "AMS:<workerCode>" — never personal data — so the scanner can
// reject unrelated QR codes by prefix alone.
export default function WorkerQrCard({ worker, showPrintButton = true, printTargetClassName = '' }) {
  return (
    <div className="worker-qr-card-wrap">
      <div className={`worker-qr-card ${printTargetClassName}`}>
        <p className="worker-qr-card-name">{worker.firstName} {worker.lastName}</p>
        <p className="worker-qr-card-id">ID: {worker.workerCode}</p>
        <div className="worker-qr-card-qr">
          <QRCodeSVG value={`AMS:${worker.workerCode}`} size={300} />
        </div>
      </div>
      {showPrintButton && (
        <Button icon={Printer} onClick={printNow} className="no-print">
          Print
        </Button>
      )}
    </div>
  );
}
