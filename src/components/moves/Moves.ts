import { Piece, PieceType, PieceColor, Position, ChessboardState } from "../chessboard/Chessboard.tsx";

export interface PieceMoves {
    moves: Position[] | null;
}

function initialize(): PieceMoves[][] {
    const initPieceMoves: PieceMoves[][] = [
        [
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
        ],
        [
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
        ],
        [
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
        ],
        [
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
        ],
        [
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
        ],
        [
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
        ],
        [
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
        ],
        [
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
            { moves: null },
        ],
    ];

    return initPieceMoves;
}

export default class Moves{

    generateAllLegalMoves(board: ChessboardState): PieceMoves[][] | boolean {
        let pieceMoves: PieceMoves[][] = initialize();
        let kingPos: Position = {x: 0, y: 0};
        let chessboard: ChessboardState = { ...board };
        let color: PieceColor = chessboard.color;
        
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if(chessboard.board[x][y]?.type === PieceType.KING && chessboard.board[x][y]?.color === color){
                    kingPos = { x, y };
                }
            }
        }

        let check: boolean = true;

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece: Piece | null = chessboard.board[x][y];
                if (piece && piece.color === color) {
                    let tempMoves: Position[] = this.generateLegalMovesForPiece(piece, { x, y }, chessboard, kingPos);
                    if(tempMoves.length !== 0){
                        pieceMoves[x][y].moves = tempMoves;
                        check = false;
                    }
                    else{
                        pieceMoves[x][y].moves = null;
                    }
                    
                }
            }
        }

        if(check){
            return this.isKingInCkeck(kingPos, {type: PieceType.KING, color: color}, kingPos, kingPos, chessboard);
        }

        return pieceMoves;
    }

    move(pos1: Position, pos2: Position, chessboard: ChessboardState, moves?: PieceMoves[][]): ChessboardState | null {
        // Check if the starting position has a piece
        const piece: Piece | null = chessboard.board[pos1.x][pos1.y];
        if (!piece) return null; // If no piece found, return null
    
        // Create a copy of the chessboard state to modify
        const updatedPieces: ChessboardState = { ...chessboard };
    
        // Check if the move is valid
        if (moves && !moves[pos1.x][pos1.y].moves?.some(move => move.x === pos2.x && move.y === pos2.y))
            return null; // If move is not valid, return null
    
        // Update en passant
        updatedPieces.enPassant = null;
    
        // Update piece details
        const updatedPiece: Piece = { ...piece };
    
        // Pawn specific logic
        if (updatedPiece.type === PieceType.PAWN) {
            if ((pos1.y === 1 && pos2.y === 3) || (pos1.y === 6 && pos2.y === 4)) {
                updatedPieces.enPassant = { x: pos2.x, y: pos2.y === 3 ? 2 : 5 };
            } else if (pos1.x !== pos2.x && updatedPieces.board[pos2.x][pos2.y] === null) {
                updatedPieces.board[pos2.x][pos2.y === 2 ? 3 : 4] = null;
            }
            // Promotion logic
            if (pos2.y === 7 - updatedPiece.color * 7) {
                updatedPiece.type = PieceType.QUEEN;
            }
        }
    
        // King specific logic
        if (updatedPiece.type === PieceType.KING) {
            // Update castling rights
            updatedPieces.castling[updatedPiece.color * 2] = false;
            updatedPieces.castling[updatedPiece.color * 2 + 1] = false;
    
            // Castling move
            if (pos1.x + 2 === pos2.x) {
                this.performCastlingMove(updatedPieces, pos2.y, 7, 5);
            } else if (pos1.x - 2 === pos2.x) {
                this.performCastlingMove(updatedPieces, pos2.y, 0, 3);
            }
        }
    
        // Rook specific logic
        if (updatedPiece.type === PieceType.ROOK && (pos1.x === 0 || pos1.x === 7) && (pos1.y === 0 || pos1.y === 7)) {
            updatedPieces.castling[(pos1.y / 7 * 2) + 1 - (pos1.x / 7)] = false;
        }
    
        // Move the piece
        updatedPieces.board[pos1.x][pos1.y] = null;
        updatedPieces.board[pos2.x][pos2.y] = updatedPiece;
    
        // Switch player turn and update full move counter
        updatedPieces.color = updatedPieces.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
        if (updatedPieces.color === PieceColor.WHITE) {
            updatedPieces.fullMove++;
        }
    
        return updatedPieces;
    }
    
    private performCastlingMove(updatedPieces: ChessboardState, y: number, rookX: number, kingX: number) {
        const tempPiece: Piece | null = updatedPieces.board[rookX][y];
        updatedPieces.board[rookX][y] = null;
        updatedPieces.board[kingX][y] = tempPiece;
    }

    private generateLegalMovesForPiece(piece: Piece, pos: Position, chessboard: ChessboardState, kingPos: Position): Position[] {
        let moves: Position[] = [];
        switch (piece.type){
            case PieceType.PAWN:
                moves = this.getPawnMoves(piece, pos, chessboard, kingPos);
                return moves;
            case PieceType.KNIGHT:
                moves = this.getKnightMoves(piece, pos, chessboard, kingPos);
                return moves;
            case PieceType.BISHOP:
                moves = this.getBishopMoves(piece, pos, chessboard, kingPos);
                return moves;
            case PieceType.ROOK:
                moves = this.getRookMoves(piece, pos, chessboard, kingPos);
                return moves;
            case PieceType.QUEEN:
                moves = this.getQueenMoves(piece, pos, chessboard, kingPos);
                return moves;
            case PieceType.KING:
                moves = this.getKingMoves(piece, pos, chessboard, kingPos);
                return moves;
            default:
                return moves;
        }
    }    

    private getPawnMoves(piece: Piece, from: Position, chessboard: ChessboardState, kingPos: Position): Position[]{
        let moves: Position[] = [];
        const direction = piece.color === PieceColor.WHITE ? 1 : -1;
        if(!this.isOccupied({ x: from.x, y: from.y + direction }, chessboard)){
            if(!this.isKingInCkeck(kingPos, piece, from, { x: from.x, y: from.y + direction }, chessboard)){
                moves.push({ x: from.x, y: from.y + direction });
            }
            if(from.y === (piece.color === PieceColor.WHITE ? 1 : 6) && !this.isOccupied({ x: from.x, y: from.y + 2 * direction }, chessboard)){
                if(!this.isKingInCkeck(kingPos, piece, from, { x: from.x, y: from.y + 2 * direction }, chessboard)){
                    moves.push({ x: from.x, y: from.y + 2 * direction });
                }
            }
        }
        if (this.isOccupied({x: from.x + 1, y: from.y + direction}, chessboard, piece.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE)) {
            if(!this.isKingInCkeck(kingPos, piece, from, {x: from.x + 1, y: from.y + direction}, chessboard)){
                moves.push({x: from.x + 1, y: from.y + direction});
            };
        }
        if (this.isOccupied({x: from.x - 1, y: from.y + direction}, chessboard, piece.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE)) {
            if(!this.isKingInCkeck(kingPos, piece, from, {x: from.x - 1, y: from.y + direction}, chessboard)){
                moves.push({x: from.x - 1, y: from.y + direction});
            };
        }
        if(chessboard.enPassant?.x === from.x + 1 && chessboard.enPassant?.y === from.y + direction){
            if(!this.isKingInCkeck(kingPos, piece, from, {x: from.x + 1, y: from.y + direction}, chessboard)){
                moves.push({x: from.x + 1, y: from.y + direction});
            };
        }
        if(chessboard.enPassant?.x === from.x - 1 && chessboard.enPassant?.y === from.y + direction){
            if(!this.isKingInCkeck(kingPos, piece, from, {x: from.x - 1, y: from.y + direction}, chessboard)){
                moves.push({x: from.x - 1, y: from.y + direction});
            };
        }
        return moves
    }

    private getKnightMoves(piece: Piece, from: Position, chessboard: ChessboardState, kingPos: Position): Position[] {
        let moves: Position[] = [];
        const knightMoves = [
            { x: 2, y: 1 },
            { x: 2, y: -1 },
            { x: -2, y: 1 },
            { x: -2, y: -1 },
            { x: 1, y: 2 },
            { x: 1, y: -2 },
            { x: -1, y: 2 },
            { x: -1, y: -2 },
        ];
    
        for (const move of knightMoves) {
            const to: Position = { x: from.x + move.x, y: from.y + move.y };
            if(this.posIsOnBoard(to) && !this.isOccupied(to, chessboard, piece.color) && !this.isKingInCkeck(kingPos, piece, from, to, chessboard)){
                moves.push(to);
            };
        }
    
        return moves;
    }
    
    private getBishopMoves(piece: Piece, from: Position, chessboard: ChessboardState, kingPos: Position): Position[] {
        const moves: Position[] = [];
    
        const addMove = (to: Position) => {
            if (!this.isKingInCkeck(kingPos, piece, from, to, chessboard)) {
                moves.push(to);
            }
        };
    
        for (let dx of [-1, 1]) {
            for (let dy of [-1, 1]) {
                for (let i = 1; i < 8; i++) {
                    const to: Position = { x: from.x + i * dx, y: from.y + i * dy };
                    if (to.x < 0 || to.x >= 8 || to.y < 0 || to.y >= 8) break;
                    if (this.isOccupied(to, chessboard)) {
                        if (this.isOccupied(to, chessboard, piece.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE)) {
                            addMove(to);
                        }
                        break;
                    }
                    addMove(to);
                }
            }
        }
    
        return moves;
    }
    
    private getRookMoves(piece: Piece, from: Position, chessboard: ChessboardState, kingPos: Position): Position[] {
        const moves: Position[] = [];
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];
    
        for (const dir of directions) {
            let x = from.x + dir.dx;
            let y = from.y + dir.dy;
            
            while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const to: Position = { x, y };
    
                if (this.isOccupied(to, chessboard)) {
                    if (this.isOccupied(to, chessboard, this.opponentColor(piece.color)) && !this.isKingInCkeck(kingPos, piece, from, to, chessboard)) {
                        moves.push(to);
                    }
                    break;
                } else if (!this.isKingInCkeck(kingPos, piece, from, to, chessboard)) {
                    moves.push(to);
                }
    
                x += dir.dx;
                y += dir.dy;
            }
        }
    
        return moves;
    }

    private getQueenMoves(piece: Piece, from: Position, chessboard: ChessboardState, kingPos: Position): Position[] {
        let moves: Position[] = [];
        moves.push(...this.getRookMoves(piece, from, chessboard, kingPos));
        moves.push(...this.getBishopMoves(piece, from, chessboard, kingPos));
        return moves;
    }
    
    private getKingMoves(piece: Piece, from: Position, chessboard: ChessboardState, kingPos: Position): Position[] {
        const moves: Position[] = [];
        const kingMoves = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: -1, y: 1 },
            { x: -1, y: 0 },
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
        ];
    
        for (const move of kingMoves) {
            const to: Position = { x: from.x + move.x, y: from.y + move.y };
            if(this.posIsOnBoard(to) && !this.isOccupied(to, chessboard, piece.color) && !this.isKingInCkeck(kingPos, piece, from, to, chessboard)){
                moves.push(to);
            };
        }
        
        if(chessboard.castling[piece.color * 2] &&
            !this.isOccupied({x: 5, y: piece.color * 7}, chessboard) &&
            !this.isOccupied({x: 6, y: piece.color * 7}, chessboard) &&
            !this.isKingInCkeck(kingPos, piece, kingPos, kingPos, chessboard) &&
            !this.isKingInCkeck({x: 5, y: piece.color * 7}, piece, {x: 5, y: piece.color * 7}, {x: 5, y: piece.color * 7}, chessboard) &&
            !this.isKingInCkeck({x: 6, y: piece.color * 7}, piece, {x: 6, y: piece.color * 7}, {x: 6, y: piece.color * 7}, chessboard)){
                moves.push({x: 6, y: piece.color * 7});
        }

        if(chessboard.castling[piece.color * 2 + 1] &&
            !this.isOccupied({x: 1, y: piece.color * 7}, chessboard) &&
            !this.isOccupied({x: 2, y: piece.color * 7}, chessboard) &&
            !this.isOccupied({x: 3, y: piece.color * 7}, chessboard) &&
            !this.isKingInCkeck(kingPos, piece, kingPos, kingPos, chessboard) &&
            !this.isKingInCkeck({x: 2, y: piece.color * 7}, piece, {x: 2, y: piece.color * 7}, {x: 2, y: piece.color * 7}, chessboard) &&
            !this.isKingInCkeck({x: 3, y: piece.color * 7}, piece, {x: 3, y: piece.color * 7}, {x: 3, y: piece.color * 7}, chessboard)){
                moves.push({x: 2, y: piece.color * 7});
         }
    
        return moves;
    }

    private isOccupied(pos: Position, boardState: ChessboardState, color?: PieceColor): boolean {
        if(this.posIsOnBoard(pos)){
            const piece: Piece | null = boardState.board[pos.x][pos.y];
            return piece !== null && (color === undefined || piece.color === color);
        }
        return false;
    }

    private posIsOnBoard(pos: Position): boolean{
        return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
    }

    private opponentColor(color: PieceColor): PieceColor {
        return color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    }

    private isKingInCkeck(kingPos: Position, piece: Piece, from: Position, to: Position, boardState: ChessboardState): boolean{
        if(piece.type === PieceType.KING){
            kingPos = to;
        }

        const newBoardState: ChessboardState = JSON.parse(JSON.stringify(boardState));
        if(piece.type === PieceType.PAWN && from.x !== to.x && newBoardState.board[to.x][to.y] === null){
            newBoardState.board[to.x][to.y === 2 ? 3 : 4] = null;
        }
        newBoardState.board[from.x][from.y] = null;
        newBoardState.board[to.x][to.y] = piece;

        //pawn
        const direction = piece.color === PieceColor.WHITE ? 1 : -1;
        if(kingPos.x + 1 < 8){
            const attackingPiece: Piece | null = newBoardState.board[kingPos.x + 1][kingPos.y + direction];
            if(attackingPiece?.type === PieceType.PAWN && attackingPiece?.color !== piece.color){
                return true;
            }
        }if(kingPos.x - 1 > 0){
            const attackingPiece: Piece | null = newBoardState.board[kingPos.x - 1][kingPos.y + direction];
            if(attackingPiece?.type === PieceType.PAWN && attackingPiece?.color !== piece.color){
                return true;
            }
        }
        
        //knight
        const knightMoves = [
            { x: 2, y: 1 },
            { x: 2, y: -1 },
            { x: -2, y: 1 },
            { x: -2, y: -1 },
            { x: 1, y: 2 },
            { x: 1, y: -2 },
            { x: -1, y: 2 },
            { x: -1, y: -2 },
        ];
    
        for (const move of knightMoves) {
            if(this.posIsOnBoard({x: kingPos.x + move.x, y: kingPos.y + move.y})){
                const attackingPiece: Piece | null = newBoardState.board[kingPos.x + move.x][kingPos.y + move.y];
                if(attackingPiece?.type === PieceType.KNIGHT && attackingPiece?.color !== piece.color){
                    return true;
                }
            }
        }

        //bishop / queen
        let directions = [
            { dx: 1, dy: 1 },
            { dx: -1, dy: -1 },
            { dx: -1, dy: 1 },
            { dx: 1, dy: -1 }
          ];
          
          for (const dir of directions) {
            let { dx, dy } = dir;
            let tempPos = { x: kingPos.x + dx, y: kingPos.y + dy };
          
            while (tempPos.x >= 0 && tempPos.x < 8 && tempPos.y >= 0 && tempPos.y < 8) {
              if (this.isOccupied(tempPos, newBoardState)) {
                const attackingPiece: Piece | null = newBoardState.board[tempPos.x][tempPos.y];
                if (attackingPiece?.color !== piece.color && (attackingPiece?.type === PieceType.BISHOP || attackingPiece?.type === PieceType.QUEEN)) {
                  return true;
                } else {
                  break;
                }
              }
              tempPos = { x: tempPos.x + dx, y: tempPos.y + dy };
            }
          }
    
        //rook / queen
        directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];
        
        for (const dir of directions) {
            let { dx, dy } = dir;
            let posX = kingPos.x + dx;
            let posY = kingPos.y + dy;
            
            while (posX >= 0 && posX < 8 && posY >= 0 && posY < 8) {
                const tempPos: Position = { x: posX, y: posY };
                if (this.isOccupied(tempPos, newBoardState)) {
                    const attackingPiece: Piece | null = newBoardState.board[posX][posY];
                    if (attackingPiece?.color !== piece.color && (attackingPiece?.type === PieceType.ROOK || attackingPiece?.type === PieceType.QUEEN)) {
                        return true;
                    }
                    break
                }
                posX += dx;
                posY += dy;
            }
        }
        

        //king
        const kingMoves = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: -1, y: 1 },
            { x: -1, y: 0 },
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
        ];
    
        for (const move of kingMoves) {
            if(this.posIsOnBoard({ x: kingPos.x + move.x, y: kingPos.y + move.y })){
                const attackingPiece: Piece | null = newBoardState.board[kingPos.x + move.x][kingPos.y + move.y];
                if (attackingPiece?.color !== piece.color && attackingPiece?.type === PieceType.KING) {
                    return true;
                }
            }
        }

        return false;
    }
}