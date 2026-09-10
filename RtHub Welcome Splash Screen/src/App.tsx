import { useState } from "react";
import SplashScreen from "./SplashScreen";
import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen";
import InvoiceScreen from "./InvoiceScreen";

type Screen = "splash" | "login" | "home" | "invoice";

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");

  return (
    <div className="size-full flex items-center justify-center bg-[#0a0f1a]">
      {screen === "splash" && <SplashScreen onLogin={() => setScreen("login")} />}
      {screen === "login" && <LoginScreen onBack={() => setScreen("splash")} onSuccess={() => setScreen("home")} />}
      {screen === "home" && <HomeScreen onPayBill={() => setScreen("invoice")} />}
      {screen === "invoice" && <InvoiceScreen onBack={() => setScreen("home")} />}
    </div>
  );
}
