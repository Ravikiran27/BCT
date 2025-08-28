import { useState } from "react";

export default function MetaMaskConnect({ onConnect }) {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        setError("");
        if (onConnect) onConnect(accounts[0]);
      } catch (err) {
        setError("Connection rejected");
      }
    } else {
      setError("MetaMask not installed");
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>Connect MetaMask</button>
      {account && <div>Connected: {account}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
