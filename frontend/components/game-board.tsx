"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Wheel } from "@/components/wheel";
import { PlayerCard } from "@/components/player-card";
import { GameOverModal } from "@/components/game-over-modal";
import { Player } from "../components/types";
import { getContract } from "../utils/ethers";
import { ethers } from "ethers";

interface GameBoardProps {
  initialPlayers: Player[];
}

export function GameBoard({ initialPlayers }: GameBoardProps) {
  const [players, setPlayers] = useState<Player[]>(
    initialPlayers.map((player) => ({
      ...player,
      number: null,
      bet: 0,
      isActive: true,
      hasQuit: false,
    }))
  );
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<
    "betting" | "spinning" | "results"
  >("betting"); // betting, spinning, results
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [roundWinner, setRoundWinner] = useState<Player | null>(null);
  const [totalPot, setTotalPot] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [betInput, setBetInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState("Place your bets!");

  // Get current player
  const currentPlayer = players[currentPlayerIndex];

  // Check if game is over
  useEffect(() => {
    const activePlayers = players.filter((p) => p.isActive && !p.hasQuit);

    if (activePlayers.length === 1) {
      setGameOver(true);
      console.log(gameOver);
      setRoundWinner(activePlayers[0]);
    } else if (players.filter((p) => !p.hasQuit).length <= 1) {
      setGameOver(true);
      console.log(gameOver);
      setRoundWinner(players.find((p) => !p.hasQuit) ?? null);
    }
  }, [players]);

  useEffect(() => {
    console.log("Players state updated:", players);
  }, [players]);

  useEffect(() => {
    console.log("Total pot updated:", totalPot);
  }, [totalPot]);

  useEffect(() => {
    console.log(message);
  }, [message]);

  useEffect(() => {
    console.log("Game phase updated:", gamePhase);
  }, [gamePhase]);

  useEffect(() => {
    if(spinResult){
    console.log(".....AND THE NUMBER IS....." + spinResult + "!");
    checkWinners(spinResult);
    }
  }, [spinResult]);

  useEffect(() => {
    if (roundWinner) {
      console.log("🏆 Updating player's money for winner:", roundWinner.name);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === roundWinner.id
            ? { ...player, money: player.money + totalPot }
            : player
        )
      );
    }
  }, [roundWinner]);

  useEffect(() => {
    if (isSpinning){
      console.log(" useeffect Spinning the wheel...");
      startSpinning();
    }
  }, [isSpinning]); // ✅ Runs when `isSpinning` updates

  // Handle player bet
  const handleBet = async () => {
    if (!numberInput || !betInput) return;
    const betAmount = parseInt(betInput, 10);
    const chosenNumber = parseInt(numberInput, 10);

    // Validate bet
    if (isNaN(betAmount) || betAmount <= 0) {
      setMessage("Please enter a valid bet amount");
      return;
    }

    if (betAmount > currentPlayer.money) {
      setMessage("You don't have enough money for this bet");
      return;
    }

    if (isNaN(chosenNumber) || chosenNumber < 1 || chosenNumber > 16) {
      setMessage("Please choose a number between 1 and 16");
      return;
    }

    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      let gasLimit;
      try {
        gasLimit = await contract.placeBet.estimateGas(
          currentPlayer.name,
          chosenNumber,
          betAmount
        );
        console.log("Estimated gas:", gasLimit.toString());
      } catch (error) {
        console.error("Gas estimation failed:", error);
        return;
      }

      const tx = await contract.placeBet(
        currentPlayer.name,
        chosenNumber,
        betAmount,
        { gasLimit }
      );
      await tx.wait(); // Wait for transaction confirmation

      setMessage(
        `${currentPlayer.name} placed a bet on ${chosenNumber} for $${betAmount}`
      );

      // Update player bet
      setPlayers((prevPlayers) =>
        prevPlayers.map((player, index) =>
          index === currentPlayerIndex
            ? {
                ...player,
                bet: betAmount,
                number: chosenNumber,
                money: player.money - betAmount,
              }
            : player
        )
      );
      
      setTotalPot((prevPot) => prevPot + betAmount);


      // Move to the next player or start the spin
      // Move to next player
      moveToNextPlayer();
    } catch (error: unknown) {
      console.error("Bet placement failed:", error);
      setMessage("Failed to place bet. Check console for errors.");
      if ((error as { reason?: string }).reason)
        console.log("Revert reason:", (error as { reason?: string }).reason);
    }
  };

  // Handle player quit
  // Handle player quit
  const handleQuit = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const tx = await contract.removePlayer(signer.address);
      await tx.wait(); // Wait for transaction confirmation

      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        hasQuit: true,
        isActive: false,
      };
      setPlayers(updatedPlayers);

      setMessage(`${currentPlayer.name} has quit the game.`);

      // Move to next player
      moveToNextPlayer();
    } catch (error: unknown) {
      console.error("Quit action failed:", error);
      if (error instanceof Error) {
        setMessage(`Failed to quit: ${error.message}`);
      } else {
        setMessage(`Failed to quit: unknown error`);
      }
    }
  };
  // Move to next active player
  const moveToNextPlayer = () => {
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    const startIndex = currentPlayerIndex;
    let allPlayersHaveBet = true;

    // Find next active player
    while (nextIndex !== startIndex) {
      if (
        players[nextIndex].isActive &&
        !players[nextIndex].hasQuit &&
        players[nextIndex].bet === 0
      ) {
        // Found an active player who hasn't bet yet
        allPlayersHaveBet = false;
        setCurrentPlayerIndex(nextIndex);
        setBetInput("");
        setNumberInput("");
        setMessage(`${players[nextIndex].name}'s turn to bet`);
        return;
      }
      nextIndex = (nextIndex + 1) % players.length;
    }

    // If we've gone through all players and they've all bet, start spinning
    if (allPlayersHaveBet) {
      startSpinning();
    }
  };

  // Start spinning the wheel
  const startSpinning = () => {
    // if (isSpinning) return; // ❗ Prevent duplicate spins

    setGamePhase("spinning");
    setIsSpinning(true);
    setMessage("Wheel is spinning...");
    console.log("🎉 Spinning the wheel...");

    setTimeout(() => {
      const result = Math.floor(Math.random() * 16) + 1;
      console.log("🎡 Wheel spun, result:", result);

      setSpinResult(result); // ✅ Update state
    }, 1000);
  };

  const checkWinners = (result: number | null) => {
    if (!result) return; // Prevent checking with a null value

    console.log("🔎 Checking winners for number:", result);

    const winners = players.filter((p) => p.isActive && p.number === result);


    if (winners.length > 0) {
      const winner = winners[0];
      setRoundWinner(winner);
      console.log("🏆 Winner found:", winner.name);
      setMessage(`${winner.name} wins with number ${winner.number}!`);

      setTimeout(() => {
        console.log("♻ Resetting players for next round...");
        setIsSpinning(false); // Stop the spin here
        setGamePhase("results"); // Move to results phase
      }, 800);
      setTimeout(() => {
        console.log("Starting new round...");
        setTotalPot(0);
        startNewRound();
      }, 1800);

    } else {
      setIsSpinning(false); // Stop the spin here
      setSpinResult(null);
      setMessage("No winnner for number " + result);
      console.log("❌ No winner, scheduling a re-spin in 3 seconds...");


      setTimeout(() => {
        console.log("🔄 Re-spinning...");
        // Backup check in case state didn't reset
        if (isSpinning) {
          console.log("⚠ Spin blocked because isSpinning is still true!");
          setIsSpinning(false); // Stop the spin here
        }

        console.log("✅ Spin allowed, restarting...");
        setIsSpinning(true);
      }, 2000);
    }
  };

  // Start a new betting round
  const startNewRound = () => {
    if (players.length < 2) {
      setMessage("At least 2 players are needed to continue.");
      return;
    }

    const activePlayers = players.filter((p) => p.isActive && !p.hasQuit);
    if (activePlayers.length === 0) {
      setGameOver(true);
      setMessage("Game Over! No active players left.");
      return;
    }

    // 🔴 Check if any active player has no money
    if (activePlayers.some((p) => p.money <= 0)) {
      setGameOver(true);
      setMessage("Game Over! A player ran out of money.");
      console.log("💀 Game Over! One or more players are broke.");
      return;
    }

    console.log("🔄 Starting new round... Resetting player bets and numbers.");

    // Reset bets and numbers for the next round
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        bet: 0, // Reset bet amount
        number: null, // Reset chosen number
      }))
    );

    setRoundWinner(null); // Reset round winner properly
    setSpinResult(null); // Reset spin result
    setTotalPot(0); // Reset total pot for the new round

    setMessage("New round! Place your bets.");
    setGamePhase("betting");
    setCurrentPlayerIndex(players.findIndex((p) => p.isActive && !p.hasQuit));
    setIsSpinning(false); // Stop auto-spinning and wait for bets
  };

  // Reset the game
  const resetGame = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      for (const player of initialPlayers) {
        const tx = await contract.register(player.name, player.money);
        await tx.wait();
      }
    } catch (error) {
      console.error("Error resetting game:", error);
      setMessage("Failed to reset game. Check console for errors.");
      return;
    }
    setPlayers(
      initialPlayers.map((player) => ({
        ...player,
        number: null,
        bet: 0,
        isActive: true,
        hasQuit: false,
      }))
    );
    setCurrentPlayerIndex(0);
    setGamePhase("betting");
    setSpinResult(null);
    setRoundWinner(null);
    setTotalPot(0);
    setGameOver(false);
    setRoundWinner(null);
    setBetInput("");
    setNumberInput("");
    setMessage("Place your bets!");
  };

  return (
    <div className="w-full max-w-5xl">
      {/* Game status */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">
          {gamePhase === "betting"
            ? "Betting Phase"
            : gamePhase === "spinning"
            ? "Wheel Spinning"
            : "Round Results"}
        </h2>
        <p className="text-xl">{message}</p>
        {totalPot > 0 && <p className="text-lg mt-2">Total Pot: ${totalPot}</p>}
      </div>

      {/* Wheel and betting area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex justify-center items-center">
          <Wheel isSpinning={isSpinning} result={spinResult} />
        </div>

        <Card className="h-full">
          <CardContent className="p-6">
            {gamePhase === "betting" &&
            currentPlayer &&
            !currentPlayer.hasQuit ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">
                  {currentPlayer.name}'s Turn
                </h3>
                <p>Available: ${currentPlayer.money}</p>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Choose a Number (1-16)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="16"
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    placeholder="Enter a number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Bet Amount
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={currentPlayer.money}
                    value={betInput}
                    onChange={(e) => setBetInput(e.target.value)}
                    placeholder="Enter bet amount"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleBet} className="flex-1">
                    Place Bet
                  </Button>
                  <Button
                    onClick={handleQuit}
                    variant="outline"
                    className="flex-1"
                  >
                    Quit Game
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                {gamePhase === "spinning" ? (
                  <p className="text-xl">Wheel is spinning...</p>
                ) : gamePhase === "results" && roundWinner ? (
                  <div className="text-center">
                    <h3 className="text-xl font-bold">Round Winner</h3>
                    <p className="text-lg">
                      {roundWinner.name} wins ${totalPot}!
                    </p>
                    <p>Winning Number: {spinResult}</p>
                  </div>
                ) : (
                  <p className="text-xl">Waiting for next round...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Player status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === currentPlayer?.id}
          />
        ))}
      </div>

      {/* Game over modal */}
      {gameOver && roundWinner && (
        <GameOverModal winner={roundWinner} onRestart={resetGame} />
      )}
    </div>
  );
}
