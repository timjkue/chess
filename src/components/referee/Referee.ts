import {
    PieceType,
    ChessboardState,
    PieceColor,
    Position
} from "../chessboard/Chessboard.tsx";

export default class Referee {

    private isOccupied(pos: Position, boardState: ChessboardState, color?: PieceColor): boolean {
        const piece = boardState.board[pos.x][pos.y];
        return piece !== null && (color === undefined || piece.color === color);
    }

    private isEnPassantValidMove(pos: Position, boardState: ChessboardState, color: PieceColor): boolean | null {
        return (
            boardState.enPassant &&
            boardState.enPassant.x === pos.x &&
            boardState.enPassant.y === pos.y &&
            boardState.board[pos.x][pos.y]?.color !== color
        );
    }

    private isPawnValidMove(previousPos: Position, newPos: Position, color: PieceColor, boardState: ChessboardState): boolean {
        const direction = color === PieceColor.WHITE ? 1 : -1;
        const deltaY = newPos.y - previousPos.y;

        if (deltaY === direction && !this.isOccupied(newPos, boardState) && previousPos.x === newPos.x) {
            return true;
        }

        const startingRow = color === PieceColor.WHITE ? 1 : 6;
        const doubleMove = deltaY === 2 * direction && previousPos.y === startingRow;

        if (doubleMove && !this.isOccupied({ x: newPos.x, y: previousPos.y + direction }, boardState) && !this.isOccupied(newPos, boardState) && previousPos.x === newPos.x) {
            return true;
        }

        const captureMove = Math.abs(previousPos.x - newPos.x) === 1 && deltaY === direction;
        if(captureMove && this.isOccupied(newPos, boardState, color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE)){
            return true;
        }

        const enPassantMove = this.isEnPassantValidMove(newPos, boardState, color);

        if(enPassantMove){
            return true;
        }

        return false;
    }

    private isKnightValidMove(previousPos: Position, newPos: Position, boardState: ChessboardState, color: PieceColor): boolean {
        const deltaX = Math.abs(newPos.x - previousPos.x);
        const deltaY = Math.abs(newPos.y - previousPos.y);

        return (
            (deltaX === 1 && deltaY === 2) ||
            (deltaX === 2 && deltaY === 1)
        ) && (!this.isOccupied(newPos, boardState) || this.isOccupied(newPos, boardState, color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE));
    }

    private isBishopValidMove(previousPos: Position, newPos: Position, boardState: ChessboardState, color: PieceColor): boolean {
        return (
            Math.abs(previousPos.x - newPos.x) === Math.abs(previousPos.y - newPos.y) &&
            !this.pathIsBlocked(previousPos, newPos, boardState) &&
            (!this.isOccupied(newPos, boardState) || this.isOccupied(newPos, boardState, color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE))
        );
    }

    private isRookValidMove(previousPos: Position, newPos: Position, boardState: ChessboardState, color: PieceColor): boolean {
        return (
            (previousPos.x === newPos.x || previousPos.y === newPos.y) &&
            !this.pathIsBlocked(previousPos, newPos, boardState) &&
            (!this.isOccupied(newPos, boardState) || this.isOccupied(newPos, boardState, color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE))
        );
    }

    private isQueenValidMove(previousPos: Position, newPos: Position, boardState: ChessboardState, color: PieceColor): boolean {
        return (
            (this.isBishopValidMove(previousPos, newPos, boardState, color) || this.isRookValidMove(previousPos, newPos, boardState, color))
        );
    }

    private isKingValidMove(previousPos: Position, newPos: Position, boardState: ChessboardState, color: PieceColor): boolean {
        const deltaX = Math.abs(newPos.x - previousPos.x);
        const deltaY = Math.abs(newPos.y - previousPos.y);

        return (deltaX <= 1 && deltaY <= 1) && (!this.isOccupied(newPos, boardState) || this.isOccupied(newPos, boardState, color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE));
    }

    private pathIsBlocked(previousPos: Position, newPos: Position, boardState: ChessboardState): boolean {
        const deltaX = previousPos.x === newPos.x ? 0 : Math.sign(newPos.x - previousPos.x);
        const deltaY = previousPos.y === newPos.y ? 0 : Math.sign(newPos.y - previousPos.y);
        let currentX = previousPos.x + deltaX;
        let currentY = previousPos.y + deltaY;

        while (currentX !== newPos.x || currentY !== newPos.y) {
            if (this.isOccupied({ x: currentX, y: currentY }, boardState)) {
                return true;
            }
            currentX += deltaX;
            currentY += deltaY;
        }

        return false;
    }

    isValideMove(
        previousPos: Position,
        newPos: Position,
        type: PieceType,
        color: PieceColor,
        boardState: ChessboardState
    ): boolean {
        switch (type) {
            case PieceType.PAWN:
                return this.isPawnValidMove(previousPos, newPos, color, boardState);
            case PieceType.KNIGHT:
                return this.isKnightValidMove(previousPos, newPos, boardState, color);
            case PieceType.BISHOP:
                return this.isBishopValidMove(previousPos, newPos, boardState, color);
            case PieceType.ROOK:
                return this.isRookValidMove(previousPos, newPos, boardState, color);
            case PieceType.QUEEN:
                return this.isQueenValidMove(previousPos, newPos, boardState, color);
            case PieceType.KING:
                return this.isKingValidMove(previousPos, newPos, boardState, color);
            default:
                return false;
        }
    }
}

/*import Chessboard, { PieceType, ChessboardState, PieceColor, Position } from "../chessboard/Chessboard.tsx";

export default class Referee {
    private tileIsOccupied(pos: Position, boardState: ChessboardState): boolean{
        if(boardState.board[pos.x][pos.y] !== null){
            return true;
        }else{
            return false;
        }
    }

    private tileIsOccupiedByOpponent(pos: Position, boardState: ChessboardState, color: PieceColor){
        if((boardState.board[pos.x][pos.y] !== null && boardState.board[pos.x][pos.y]?.color !== color)){
            return true;
        }else{
            return false;
        }
    }

    private isEnPassantValideMove(pos: Position, boardState: ChessboardState, color: PieceColor){
        if((boardState.enPassant && boardState.enPassant.x === pos.x && boardState.enPassant.y ===pos.y && boardState.board[pos.x][pos.y]?.color !== color)){
            return true;
        }else{
            return false;
        }
    }

    private pathIsBlocked(previousPos: Position, newPos: Position, boardState: ChessboardState): boolean {
        const deltaX = previousPos.x === newPos.x ? 0 : Math.sign(newPos.x - previousPos.x);
        const deltaY = previousPos.y === newPos.y ? 0 : Math.sign(newPos.y - previousPos.y);
        let currentX = previousPos.x + deltaX;
        let currentY = previousPos.y + deltaY;

        while (currentX !== newPos.x || currentY !== newPos.y) {
            if (this.tileIsOccupied({ x: currentX, y: currentY }, boardState)) {
                return true;
            }
            currentX += deltaX;
            currentY += deltaY;
        }

        return false;
    }

    isValideMove(
        previousPos: Position,
        newPos: Position,
        type: PieceType,
        color: PieceColor,
        boardState: ChessboardState,
    ): boolean{

        if(type === PieceType.PAWN){
            if(color === PieceColor.WHITE){
                if(previousPos.x === newPos.x && newPos.y - previousPos.y === 1 && !this.tileIsOccupied(newPos, boardState)){
                    return true;
                }else if(previousPos.x === newPos.x && previousPos.y === 1 && newPos.y === 3 && !this.tileIsOccupied({x: newPos.x, y: 2}, boardState) && !this.tileIsOccupied({x: newPos.x, y: 2}, boardState)){
                    return true;
                }else if((previousPos.x === newPos.x+1 || previousPos.x === newPos.x-1) && newPos.y - previousPos.y === 1 && (this.tileIsOccupiedByOpponent(newPos, boardState, color) || this.isEnPassantValideMove(newPos, boardState, color))){
                    return true;
                }
            }
            if(color === PieceColor.BLACK){
                if(previousPos.x === newPos.x && previousPos.y - newPos.y === 1 && !this.tileIsOccupied(newPos, boardState)){
                    return true;
                }else if(previousPos.x === newPos.x && previousPos.y === 6 && newPos.y === 4 && !this.tileIsOccupied({x: newPos.x, y: 5}, boardState) && !this.tileIsOccupied({x: newPos.x, y: 5}, boardState)){
                    return true;
                }else if((previousPos.x === newPos.x+1 || previousPos.x === newPos.x-1) && previousPos.y - newPos.y === 1 && (this.tileIsOccupiedByOpponent(newPos, boardState, color) || this.isEnPassantValideMove(newPos, boardState, color))){
                    return true;
                }
            }
        }else if(type === PieceType.KNIGHT){
            if(
                (((previousPos.x - newPos.x === 1 || newPos.x - previousPos.x === 1) && (previousPos.y - newPos.y === 2 || newPos.y - previousPos.y === 2)) ||
                ((previousPos.x - newPos.x === 2 || newPos.x - previousPos.x === 2) && (previousPos.y - newPos.y === 1 || newPos.y - previousPos.y === 1))) &&
                (!this.tileIsOccupied(newPos, boardState) || this.tileIsOccupiedByOpponent(newPos, boardState, color))){
                return true;
            }
        }else if(type === PieceType.BISHOP){
            return (
                Math.abs(previousPos.x - newPos.x) === Math.abs(previousPos.y - newPos.y) &&
                !this.pathIsBlocked(previousPos, newPos, boardState) &&
                (!this.tileIsOccupied(newPos, boardState) || this.tileIsOccupiedByOpponent(newPos, boardState, color))
            );
        }else if(type === PieceType.ROOK){
            return (
                (previousPos.x === newPos.x || previousPos.y === newPos.y) &&
                !this.pathIsBlocked(previousPos, newPos, boardState) &&
                (!this.tileIsOccupied(newPos, boardState) || this.tileIsOccupiedByOpponent(newPos, boardState, color))
            );
        }

        return false;
    }
}*/