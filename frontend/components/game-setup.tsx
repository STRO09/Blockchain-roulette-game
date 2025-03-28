"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import {Player} from "../components/types"

// Define props type for GameSetup
interface GameSetupProps {
  onStartGame: (players: Player[]) => void // Function to start the game with an array of players
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [players, setPlayers] = useState([
    { id: 1, name: "", money: 1000 , bet: 0, isActive: true, hasQuit: false, number: null},
    { id: 2, name: "", money: 1000 , bet: 0, isActive: true, hasQuit: false, number: null},
  ])
  const [error, setError] = useState("")

  const addPlayer = () => {
    if (players.length >= 4) {
      setError("Maximum 4 players allowed")
      return
    }

    setPlayers([...players, { id: Date.now(), name: "", money: 1000, bet: 0, isActive: true, hasQuit: false , number: null }])
    setError("")
  }

  const removePlayer = (id: number) => {
    if (players.length <= 2) {
      setError("Minimum 2 players required")
      return
    }

    setPlayers(players.filter((player) => player.id !== id))
    setError("")
  }

  const updatePlayer = (id: number, field: string, value: string) => {
    setPlayers(
      players.map((player) =>
        player.id === id ? { ...player, [field]: field === "money" ? Number.parseInt(value) || 0 : value } : player,
      ),
    )
  }

  const handleStartGame = () => {
    // Validate all players have names
    if (players.some((player) => !player.name.trim())) {
      setError("All players must have names")
      return
    }

    // Validate all players have money
    if (players.some((player) => player.money <= 0)) {
      setError("All players must start with money")
      return
    }

    // Check for duplicate names
    const names = players.map((p) => p.name.trim())
    if (new Set(names).size !== names.length) {
      setError("All players must have unique names")
      return
    }

      // Log players data before starting the game
  console.log("Final Players Data:", players)
    onStartGame(players)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Player Setup</CardTitle>
        <CardDescription>Enter player information to start the game</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.map((player, index) => (
          <div key={player.id} className="space-y-2 p-3 border rounded-md">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Player {index + 1}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePlayer(player.id)}
                disabled={players.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`name-${player.id}`}>Name</Label>
              <Input
                id={`name-${player.id}`}
                value={player.name}
                onChange={(e) => updatePlayer(player.id, "name", e.target.value)}
                placeholder="Enter player name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`money-${player.id}`}>Starting Money</Label>
              <Input
                id={`money-${player.id}`}
                type="number"
                value={player.money}
                onChange={(e) => updatePlayer(player.id, "money", e.target.value)}
                min="1"
              />
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full" onClick={addPlayer} disabled={players.length >= 4}>
          <Plus className="mr-2 h-4 w-4" /> Add Player
        </Button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleStartGame}>
          Start Game
        </Button>
      </CardFooter>
    </Card>
  )
}

