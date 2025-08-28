import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState } from 'react';
import RoleSelect from "./pages/RoleSelect";
import ManufacturerPage from "./pages/ManufacturerPage";
import DistributorPage from "./pages/DistributorPage";
import RetailerPage from "./pages/RetailerPage";
import ConsumerPage from "./pages/ConsumerPage";
import MetaMaskConnect from "./metamask/MetaMaskConnect";

function App() {
  const [address, setAddress] = useState(null);
  const [role, setRole] = useState(null);

  if (!address) {
    return <MetaMaskConnect onConnect={setAddress} />;
  }

  if (!role) {
    return <RoleSelect onSelect={setRole} />;
  }

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to={`/${role}`} />} />
          <Route path="/1" element={<ManufacturerPage />} />
          <Route path="/2" element={<DistributorPage />} />
          <Route path="/3" element={<RetailerPage />} />
          <Route path="/4" element={<ConsumerPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;