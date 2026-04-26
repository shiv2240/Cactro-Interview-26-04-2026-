import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ReleaseList from "./components/ReleaseList";
import ReleaseEditor from "./components/ReleaseEditor";

function App() {
  return (
    <Router>
      <div className="app-container">
        <header>
          <h1>ReleaseCheck</h1>
          <p>Your all-in-one release checklist tool</p>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<ReleaseList />} />
            <Route path="/new" element={<ReleaseEditor />} />
            <Route path="/releases/:id" element={<ReleaseEditor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
