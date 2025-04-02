// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract WheelBet {
    struct Player {
        string name;
        uint balance;
        bool isActive;
    }

    mapping(string => Player) public players;
    string[] public playerList;

    event BetPlaced(string indexed playerName, uint number, uint amount);
    event GameWon(string indexed winner, uint winnings);
    event PlayerOut(string indexed player);
    event GameEnded(string indexed winner);
    event GameReset();

    function register(string memory _name, uint _initialBalance) public {
        require(bytes(players[_name].name).length == 0, "Player already registered");
        players[_name] = Player(_name, _initialBalance, true);
        playerList.push(_name);
    }

    function placeBet(string memory _name, uint _number, uint _amount) public {
        require(players[_name].isActive, "Player is not active");
        require(players[_name].balance >= _amount, "Not enough balance");

        players[_name].balance -= _amount;
        emit BetPlaced(_name, _number, _amount);
    }

    function updateWinner(string memory _winner, uint _winnings) public {
        require(players[_winner].isActive, "Winner is not active");
        players[_winner].balance += _winnings;
        emit GameWon(_winner, _winnings);
    }

    function removePlayer(string memory _player) public {
        require(players[_player].isActive, "Player already removed");
        players[_player].isActive = false;
        emit PlayerOut(_player);
    }

    function checkGameEnd() public returns (bool) {
        uint activePlayers = 0;
        string memory lastPlayer;

        for (uint i = 0; i < playerList.length; i++) {
            if (players[playerList[i]].isActive) {
                activePlayers++;
                lastPlayer = playerList[i];
            }
        }

        if (activePlayers == 1) {
            emit GameEnded(lastPlayer);
            return true;
        }

        return false;
    }
        function resetGame() public {
        for (uint i = 0; i < playerList.length; i++) {
            delete players[playerList[i]];
        }
        delete playerList;
        emit GameReset();
    }
}
