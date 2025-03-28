import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {Player} from "../components/types"
interface PlayerCardProps {
  player: Player;         // Add the player type here
  isCurrentPlayer: boolean;
}

export function PlayerCard({ player, isCurrentPlayer }: PlayerCardProps) {
  return (
    <Card className={`overflow-hidden ${isCurrentPlayer ? "border-2 border-yellow-500" : ""}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg truncate">{player.name}</h3>
          {player.hasQuit && (
            <Badge variant="outline" className="bg-red-500 text-white">
              Quit
            </Badge>
          )}
          {!player.isActive && !player.hasQuit && (
            <Badge variant="outline" className="bg-gray-500 text-white">
              Out
            </Badge>
          )}
          {isCurrentPlayer && (
            <Badge variant="outline" className="bg-yellow-500 text-black">
              Turn
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Money:</span>
            <span className="font-medium">${player.money}</span>
          </div>

          {player.bet > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Bet:</span>
              <span className="font-medium">${player.bet}</span>
            </div>
          )}

          {player.number && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Number:</span>
              <span className="font-medium">{player.number}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

