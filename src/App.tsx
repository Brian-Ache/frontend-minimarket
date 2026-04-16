
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
