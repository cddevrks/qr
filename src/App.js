// src/App.js
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle2, XCircle, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/Alert";

function App() {
  const [scanResult, setScanResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validCodes, setValidCodes] = useState(() => {
    // Get codes from localStorage or use default values
    const savedCodes = localStorage.getItem("validQRCodes");
    return savedCodes ? JSON.parse(savedCodes) : ["123456", "789012", "ABC123"];
  });
  const [newCode, setNewCode] = useState("");
  const [showDatabase, setShowDatabase] = useState(false);

  // Use ref to store scanner instance
  const scannerRef = useRef(null);

  useEffect(() => {
    // Store valid codes in localStorage whenever they change
    localStorage.setItem("validQRCodes", JSON.stringify(validCodes));
  }, [validCodes]);

  useEffect(() => {
    // Create QR Scanner instance
    scannerRef.current = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
    });

    const success = (result) => {
      if (!scannerRef.current) return;
      scannerRef.current.clear();
      setScanResult(result);
      const valid = validCodes.includes(result);
      setIsValid(valid);
      setShowModal(true);
    };

    const error = (err) => {
      console.warn(err);
    };

    scannerRef.current.render(success, error);

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.warn("Error clearing scanner", err));
        scannerRef.current = null;
      }
    };
  }, [validCodes]);

  const addCode = (e) => {
    e.preventDefault();
    if (newCode && !validCodes.includes(newCode)) {
      setValidCodes([...validCodes, newCode]);
      setNewCode("");
    }
  };

  const removeCode = (codeToRemove) => {
    setValidCodes(validCodes.filter((code) => code !== codeToRemove));
  };

  const restartScanner = () => {
    setShowModal(false);
    setScanResult(null);
    // Properly cleanup and reinitialize scanner
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current.render(
        (result) => {
          scannerRef.current.clear();
          setScanResult(result);
          const valid = validCodes.includes(result);
          setIsValid(valid);
          setShowModal(true);
        },
        (err) => console.warn(err)
      );
    }
  };

  const DatabaseManager = () => (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Valid QR Codes Database</h2>
        <button
          onClick={() => setShowDatabase(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <form onSubmit={addCode} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="Enter new QR code value"
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Code
        </button>
      </form>

      <div className="space-y-2">
        {validCodes.map((code) => (
          <div
            key={code}
            className="flex justify-between items-center p-2 bg-gray-50 rounded"
          >
            <span>{code}</span>
            <button
              onClick={() => removeCode(code)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const Modal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <Alert className={isValid ? "bg-green-50" : "bg-red-50"}>
          <div className="flex items-center gap-4">
            {isValid ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
            <div>
              <AlertTitle
                className={`text-lg ${
                  isValid ? "text-green-800" : "text-red-800"
                }`}
              >
                {isValid ? "Verified Successfully" : "Invalid Code"}
              </AlertTitle>
              <AlertDescription className="mt-2 text-sm">
                {isValid
                  ? "The scanned QR code is valid!"
                  : "The scanned QR code is not in our database."}
              </AlertDescription>
            </div>
          </div>
        </Alert>
        <div className="mt-4 text-sm text-gray-600">
          Scanned value: {scanResult}
        </div>
        <button
          onClick={restartScanner}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Scan Another Code
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">QR Code Scanner</h1>
          <button
            onClick={() => setShowDatabase(!showDatabase)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Manage Database
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div id="reader" className="mb-4"></div>
          {showModal && <Modal />}
        </div>

        {showDatabase && <DatabaseManager />}
      </div>
    </div>
  );
}

export default App;
