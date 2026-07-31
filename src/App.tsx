import { Routes, Route } from "react-router-dom";
import { LabPage } from "./pages/LabPage";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LabPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}