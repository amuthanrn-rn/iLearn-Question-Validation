import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import AIValidation from "./pages/AIValidation";
import FailedQuestions from "./pages/FailedQuestions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/ai-validation" element={<AIValidation />} />
        <Route path="/failed-questions" element={<FailedQuestions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
