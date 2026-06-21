import { useEffect, useState } from "react";
import { MainApp } from "@/MainApp";
import { AdminScreen } from "@/screens/AdminScreen";
import { ClientView } from "@/screens/ClientView";

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();
  const route = hash.replace(/^#\/?/, ""); // "", "admin", "k/<token>"

  if (route === "admin") return <AdminScreen />;
  if (route.startsWith("k/")) {
    const token = decodeURIComponent(route.slice(2));
    return <ClientView token={token} />;
  }
  return <MainApp />;
}
