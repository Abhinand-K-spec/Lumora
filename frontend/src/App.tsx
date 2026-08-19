import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";
import "./index.css";

function App() {
  return (
    <>
      <Toaster theme="dark" richColors position="top-right" />
      <AppRoutes />
    </>
  );
}

export default App;
