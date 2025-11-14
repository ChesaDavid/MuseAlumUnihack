"use client";

import { QRCodeSVG } from "qrcode.react";

const QRGenerator:React.FC = ()=> {
  return (
    <div className="p-6">
      <QRCodeSVG
        value="https://musealum.com/exhibit/123"
        size={200}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
      />
    </div>
  );
}
export default QRGenerator;