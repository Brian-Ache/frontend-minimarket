import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <div className="w-screen h-screen flex flex-col overflow-hidden">

        {/*Navbar */}
        <div className="shrink-0">
          <Navbar />
        </div>

        {/*Contenido */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AppRouter />
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;
