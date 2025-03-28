"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { GameSetup } from "@/components/game-setup";
import { GameBoard } from "@/components/game-board";
import { getContract } from "@/utils/ethers";
import {Player } from "../components/types";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string>("");

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" }); // Request MetaMask connection
          const tempProvider = new ethers.BrowserProvider(window.ethereum);
          const tempSigner = await tempProvider.getSigner();
          setProvider(tempProvider);
          setSigner(tempSigner);

          const accounts = await tempProvider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
          }

          const tempContract = getContract(tempSigner);
          setContract(tempContract);
        } catch (error) {
          console.error("Error connecting wallet:", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    connectWallet();
  }, []);

  const startGame = async (registeredPlayers: { name: string; money: number }[]) => {

    const formattedPlayers: Player[] = registeredPlayers.map((player, index) => ({
      id: index + 1,
      name: player.name,
      money: player.money,
      number: null,
      bet: 0,
      isActive: true,
      hasQuit: false,
    }));


    setPlayers(formattedPlayers);
    setGameStarted(true);

    if (!contract || !currentAccount) {
      console.error("Contract not initialized or wallet not connected");
      return;
    }

    for (const player of formattedPlayers) {
      try {
        const tx = await contract.register(player.name, player.money);
        await tx.wait();
        console.log(`Player ${player.name} registered successfully`);
      } catch (error) {
        console.error("Error registering player:", error);
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Wheel Betting Game</h1>

      {!gameStarted ? <GameSetup onStartGame={startGame} /> : <GameBoard initialPlayers={players} />}
    </main>
  );
}
