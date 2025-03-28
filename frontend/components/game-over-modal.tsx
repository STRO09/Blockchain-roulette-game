// GameOverModal.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Player } from '../components/types';  // Import the Player type if defined in a separate file

interface GameOverModalProps {
  winner: Player; // Define the winner prop as Player type
  onRestart: () => void; // Define the onRestart prop as a function that doesn't return anything
}

export function GameOverModal({ winner, onRestart }: GameOverModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Game Over!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold">{winner.name} Wins!</h3>
            <p className="text-lg mt-2">Final Balance: ${winner.money}</p>
          </div>
          <p>Congratulations to the winner! All other players have either quit or lost all their money.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onRestart} className="w-full">
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
