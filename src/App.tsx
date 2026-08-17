import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="w-screen h-screen flex flex-col overflow-hidden">
          <div className="shrink-0">
            <Navbar />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
            <AppRouter />
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
