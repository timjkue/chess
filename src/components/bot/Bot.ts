import { ChessboardState, Position, Piece, PieceColor, PieceType } from "../chessboard/Chessboard.tsx";
import { PieceMoves } from "../moves/Moves.ts";
import Moves from "../moves/Moves.ts";
import { pieceValues, pieceScores } from "../pieceScores/PieceScores.js";

export default class Bot {
    pieceScores = pieceScores;
    pieceValues = pieceValues;
    move = new Moves;

    getBotMove(moves: PieceMoves[][], chessboard: ChessboardState): {pos1: Position, pos2: Position} {
        let test: String = "";
        for (let y = 7; y >= 0; y--) {
            test = `${y}:`;
            for (let x = 0; x < 8; x++) {
                const relativePos: Position = {x, y};
                test += `${pieceScores[PieceType.PAWN][7-relativePos.y][relativePos.x]},`;
            }
            console.log(test);
        }

        for (let y = 7; y >= 0; y--) {
            test = `${y}:`;
            for (let x = 0; x < 8; x++) {
                const relativePos: Position = {x, y: 7 - y};
                test += `${pieceScores[PieceType.PAWN][7-relativePos.y][relativePos.x]},`;
            }
            console.log(test);
        }


        let {pos1, pos2} = {pos1: {x: 0, y: 0}, pos2: {x: 0, y: 0}};
        let bestScore = -Infinity;

        for (let x = 0; x < moves.length; x++) {
            for (let y = 0; y < moves[x].length; y++) {
                moves[x][y].moves?.forEach(move => {
                    const modifiedChessboard = this.move.move({x, y}, {x: move.x, y: move.y}, JSON.parse(JSON.stringify(chessboard)));
                    if (modifiedChessboard) {
                        // Call minimax to find the best move
                        const newScore = this.minimax(modifiedChessboard, 2, chessboard.color === PieceColor.WHITE); // Adjust the depth as needed

                        if (newScore > bestScore || (pos1.x === pos2.x && pos1.y === pos2.y)) {
                            pos1 = {x: x, y: y};
                            pos2 = {x: move.x, y: move.y};
                            bestScore = newScore;
                        }
                    }
                });
            }
        }

        return {pos1, pos2};
    }

    // Minimax algorithm
    minimax(chessboard: ChessboardState, depth: number, maximizingPlayer: boolean): number {
        if (depth === 0) {
            return this.getScore(chessboard);
        }

        if (maximizingPlayer) {
            let maxScore = -Infinity;

            // Iterate through possible moves
            const possibleMoves = this.move.generateAllLegalMoves(chessboard);
            if(typeof possibleMoves === "boolean"){
                if(possibleMoves){
                    return -Infinity;
                }
                else{
                    return Infinity;
                }
            }

            for (let x = 0; x < possibleMoves.length; x++) {
                for (let y = 0; y < possibleMoves[x].length; y++) {
                    possibleMoves[x][y].moves?.forEach(move => {
                        const modifiedChessboard = this.move.move({ x, y }, move, JSON.parse(JSON.stringify(chessboard)));
                        if (modifiedChessboard) {
                            // Recursively call minimax
                            const score = this.minimax(modifiedChessboard, depth - 1, false);
                            // Update maxScore
                            maxScore = Math.max(maxScore, score);
                        }
                    });
                }
            }

            return maxScore;
        } else {
            let minScore = Infinity;

            // Iterate through possible moves
            const possibleMoves = this.move.generateAllLegalMoves(chessboard);

            if(typeof possibleMoves === "boolean"){
                if(!possibleMoves){
                    return -Infinity;
                }
                else{
                    return Infinity;
                }
            }

            for (let x = 0; x < possibleMoves.length; x++) {
                for (let y = 0; y < possibleMoves[x].length; y++) {
                    possibleMoves[x][y].moves?.forEach(move => {
                        const modifiedChessboard = this.move.move({ x, y }, move, JSON.parse(JSON.stringify(chessboard)));
                        if (modifiedChessboard) {
                            // Recursively call minimax
                            const score = this.minimax(modifiedChessboard, depth - 1, true);
                            // Update minScore
                            minScore = Math.min(minScore, score);
                        }
                    });
                }
            }

            return minScore;
        }
    }

    private getScore(chessboard: ChessboardState): number {
        let score = 0;

        for (let x = 0; x < chessboard.board.length; x++) {
            for (let y = 0; y < chessboard.board[x].length; y++) {
                const piece = chessboard.board[x][y];
                if (piece) {
                    score += (piece.color !== chessboard.color ? 1 : -1) * pieceValues[piece.type] * 100;
                    const relativePos: Position = piece.color === PieceColor.WHITE ? {x, y} : {x, y: 7 - y};
                    score += pieceScores[piece.type][7 - relativePos.y][relativePos.x];
                }
            }
        }
        return score;
    }
}