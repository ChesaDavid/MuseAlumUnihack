"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContex";
import { Upload, Download, Trophy, Zap } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.5 },
  }),
};

export const QRGenerator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const storage = getStorage();
  const db = getFirestore();
  const auth = useAuth() as any;
  const user = auth?.user;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const imgRef = ref(storage, `badges/${user.uid}/${file.name}`);
      await uploadBytes(imgRef, file);

      const downloadURL = await getDownloadURL(imgRef);
      setImage(downloadURL);

      const qr = await QRCode.toDataURL(downloadURL);
      setQrUrl(qr);

      await setDoc(doc(db, "badges", user.uid), {
        owned: arrayUnion({ image: downloadURL, created: Date.now() }),
      }, { merge: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div custom={0} variants={containerVariants} initial="hidden" animate="visible">
      <Card className="p-8 bg-linear-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Zap className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-blue-900">Generate Badge QR</h2>
        </div>
        
        <div className="space-y-4">
          <label className="block">
            <div className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 cursor-pointer transition bg-white">
              <Upload className="text-blue-600 mr-2" size={20} />
              <span className="text-blue-700 font-medium">Click to upload badge image</span>
            </div>
            <input type="file" onChange={handleImageUpload} className="hidden" />
          </label>

          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {qrUrl && image && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Badge Image</p>
                  <img src={image} alt="Badge" className="w-full rounded-lg border border-gray-200" />
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">QR Code</p>
                  <img src={qrUrl} alt="Generated QR" className="w-full rounded-lg border border-gray-200" />
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Download QR Code</Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};


export const QRScannerComponent = () => {
  const auth = useAuth() as any;
  const user = auth?.user;
  const db = getFirestore();
  const [scannedData, setScannedData] = useState<string | null>(null);

  const handleScan = async (detectedCodes: any[]) => {
    if (!user || !detectedCodes || detectedCodes.length === 0) return;

    const result = detectedCodes[0].rawValue;
    if (!result) return;

    setScannedData(result);

    try {
      await updateDoc(doc(db, "badges", user.uid), {
        scanned: arrayUnion({ url: result, scannedAt: Date.now() })
      });
    } catch {
      await setDoc(doc(db, "badges", user.uid), {
        scanned: [{ url: result, scannedAt: Date.now() }]
      }, { merge: true });
    }
  };

  return (
    <motion.div custom={1} variants={containerVariants} initial="hidden" animate="visible">
      <Card className="p-8 bg-linear-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Download className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-purple-900">Scan Badge QR</h2>
        </div>

        <div className="bg-white rounded-lg p-4 text-center border">
          <Scanner
            onScan={handleScan}
            onError={(err: any) => console.error("Scanner error:", err)}
            constraints={{ facingMode: "environment" }}
          />
        </div>

        {scannedData && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300"
          >
            <p className="text-green-800 font-medium">✓ Scanned: {scannedData}</p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};


export const BadgeDashboard = () => {
  const auth = useAuth() as any;
  const user = auth?.user;
  const db = getFirestore();
  const [ownedBadges, setOwnedBadges] = useState<any[]>([]);
  const [scannedBadges, setScannedBadges] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const docRef = await getDoc(doc(db, "badges", user.uid));
      if (docRef.exists()) {
        const data = docRef.data();
        setOwnedBadges(data.owned || []);
        setScannedBadges(data.scanned || []);
      }
    };
    load();
  }, [user]);

  return (
    <motion.div custom={2} variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <Card className="p-8 bg-linear-to-br from-amber-50 to-amber-100 border-amber-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-600 rounded-lg">
              <span className="text-white text-xl font-bold">⭐</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-900">Your Badges</h2>
              <p className="text-amber-700 text-sm">Collected: {ownedBadges.length}</p>
            </div>
          </div>
        </div>
        
        {ownedBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ownedBadges.map((b, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative group cursor-pointer">
                <img src={b.image} alt={`Badge ${i}`} className="w-full rounded-lg border-2 border-amber-300 shadow-md group-hover:shadow-lg transition" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">View</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-amber-700">
            <p className="text-lg font-medium">No badges yet. Start exploring! 🎉</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export const WorldRanking = () => {
  return (
    <motion.div custom={3} variants={containerVariants} initial="hidden" animate="visible">
      <Card className="p-8 bg-linear-to-br from-rose-50 to-rose-100 border-rose-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-rose-600 rounded-lg">
            <Trophy className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-rose-900">World Ranking</h2>
        </div>
        
        <div className="bg-white rounded-lg p-8 text-center space-y-3">
          <p className="text-gray-600">Your global ranking based on badges collected and scanned</p>
          <div className="text-4xl font-bold text-rose-600">#1,234</div>
          <p className="text-sm text-gray-500">Coming soon — compete globally! 🌍</p>
        </div>
      </Card>
    </motion.div>
  );
};

const DashboardFeatures = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your badges and track your achievements</p>
        </motion.div>
        
        <div className="space-y-8">
          <QRGenerator />
          <QRScannerComponent />
          <BadgeDashboard />
          <WorldRanking />
        </div>
      </div>
    </div>
  );
};

export default DashboardFeatures;
