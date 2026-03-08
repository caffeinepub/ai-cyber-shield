import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import CyberbullyingDetector from "./pages/CyberbullyingDetector";
import Dashboard from "./pages/Dashboard";
import DeepfakeDetection from "./pages/DeepfakeDetection";
import FakeJobDetector from "./pages/FakeJobDetector";
import PasswordChecker from "./pages/PasswordChecker";
import QRScanner from "./pages/QRScanner";
import ThreatMap from "./pages/ThreatMap";
import WiFiScanner from "./pages/WiFiScanner";

export type PageId =
  | "dashboard"
  | "deepfake"
  | "fakejob"
  | "password"
  | "qrscanner"
  | "cyberbullying"
  | "wifi"
  | "threatmap";

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "deepfake":
        return <DeepfakeDetection />;
      case "fakejob":
        return <FakeJobDetector />;
      case "password":
        return <PasswordChecker />;
      case "qrscanner":
        return <QRScanner />;
      case "cyberbullying":
        return <CyberbullyingDetector />;
      case "wifi":
        return <WiFiScanner />;
      case "threatmap":
        return <ThreatMap />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      <main className="flex-1 overflow-y-auto lg:ml-0">
        <div className="min-h-screen">{renderPage()}</div>
      </main>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.155 0.01 260)",
            border: "1px solid oklch(0.28 0.025 240)",
            color: "oklch(0.92 0.01 210)",
          },
        }}
      />
    </div>
  );
}
