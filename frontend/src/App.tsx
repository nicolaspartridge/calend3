import { useState, useEffect } from "react";

import detectEthereumProvider from "@metamask/detect-provider";

import Calendar from "./components/Calendar";

function App() {
  const [account, setAccount] = useState<String>("");

  useEffect(() => {
    isConnected();
  }, []);

  const isConnected = async () => {
    const provider: any = await detectEthereumProvider();
    const accounts = await provider.request({
      method: "eth_accounts",
    });

    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      console.log("No authorized accounts");
    }
  };

  const connect = async () => {
    try {
      const provider: any = await detectEthereumProvider();
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <h1>calend3</h1>
      <div>web3 appointment scheduling</div>
      {account.length ? (
        <Calendar />
      ) : (
        <button onClick={connect}>Connect wallet</button>
      )}
    </div>
  );
}

export default App;
