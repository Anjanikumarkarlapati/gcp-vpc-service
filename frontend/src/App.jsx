import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Perimeter from "./pages/Perimeter";
import Violations from "./pages/Violations";
import Runbook from "./pages/Runbook";
import Tests from "./pages/Tests";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="perimeter" element={<Perimeter />} />
        <Route path="violations" element={<Violations />} />
        <Route path="runbook" element={<Runbook />} />
        <Route path="tests" element={<Tests />} />
        <Route path="*" element={<p className="empty">Page not found.</p>} />
      </Route>
    </Routes>
  );
}
