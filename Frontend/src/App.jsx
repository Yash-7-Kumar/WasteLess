import "./App.css";
import api from "./urlServices";
import NavBar from "./otherComponents/navBar";
import Home from "./otherComponents/Home";
import StudentCount from "./otherComponents/StudentCount";
import { Routes, Route } from "react-router-dom";
import GetPredictionFor from "./otherComponents/GetPredictionfor";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<GetPredictionFor />} />
        <Route path="/predict/:meal" element={<StudentCount />} />
      </Routes>
    </div>
  );
}

export default App;
