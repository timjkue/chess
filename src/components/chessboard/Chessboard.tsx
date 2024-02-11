import React, {useRef, useState, useEffect} from "react";
import Tile, { TileColor } from "../tile/Tile.tsx"
import "./Chessboard.css";
import Moves, { PieceMoves } from "../moves/Moves.ts";

export enum PieceType {
    PAWN,
    KNIGHT,
    BISHOP,
    ROOK,
    QUEEN,
    KING
}

export enum PieceColor{
    WHITE,
    BLACK
}

export interface Piece{
    type: PieceType;
    color: PieceColor;
}

export interface Position {
    x: number;
    y: number;
}

export interface ChessboardState {
    board: (Piece | null)[][];
    enPassant: Position | null;
    castling: boolean[];
}

function initializeChessboard(): ChessboardState {
    const startingChessboard: ChessboardState = {
        board: [
            [
                { type: PieceType.ROOK, color: PieceColor.WHITE },
                { type: PieceType.PAWN, color: PieceColor.WHITE },
                null,
                null,
                null,
                null,
                { type: PieceType.PAWN, color: PieceColor.BLACK },
                { type: PieceType.ROOK, color: PieceColor.BLACK },
            ],
            [
                { type: PieceType.KNIGHT, color: PieceColor.WHITE },
                { type: PieceType.PAWN, color: PieceColor.WHITE },
                null,
                null,
                null,
                null,
                { type: PieceType.PAWN, color: PieceColor.BLACK },
                { type: PieceType.KNIGHT, color: PieceColor.BLACK },
            ],
            [
                { type: PieceType.BISHOP, color: PieceColor.WHITE },
                { type: PieceType.PAWN, color: PieceColor.WHITE },
                null,
                null,
                null,
                null,
                { type: PieceType.PAWN, color: PieceColor.BLACK },
                { type: PieceType.BISHOP, color: PieceColor.BLACK },
            ],
            [
                { type: PieceType.QUEEN, color: PieceColor.WHITE },
                { type: PieceType.PAWN, color: PieceColor.WHITE },
                null,
                null,
                null,
                null,
                { type: PieceType.PAWN, color: PieceColor.BLACK },
                { type: PieceType.QUEEN, color: PieceColor.BLACK },
            ],
            [
                { type: PieceType.KING, color: PieceColor.WHITE },
                { type: PieceType.PAWN, color: PieceColor.WHITE },
                null,
                null,
                null,
                null,
                { type: PieceType.PAWN, color: PieceColor.BLACK },
                { type: PieceType.KING, color: PieceColor.BLACK },
            ],
            [
                { type: PieceType.BISHOP, color: PieceColor.WHITE },
                { type: PieceType.PAWN, color: PieceColor.WHITE },
                null,
                null,
                null,
                null,
                { type: PieceType.PAWN, color: PieceColor.BLACK },
                { type: PieceType.BISHOP, color: PieceColor.BLACK },
            ],
            [
                { type: PieceType.KNIGHT, color: PieceColor.WHITE },
                { type: PieceType.PAWN, color: PieceColor.WHITE },
                null,
                null,
                null,
                null,
                { type: PieceType.PAWN, color: PieceColor.BLACK },
                { type: PieceType.KNIGHT, color: PieceColor.BLACK },
            ],
            [
                { type: PieceType.ROOK, color: PieceColor.WHITE },
                { type: PieceType.PAWN, color: PieceColor.WHITE },
                null,
                null,
                null,
                null,
                { type: PieceType.PAWN, color: PieceColor.BLACK },
                { type: PieceType.ROOK, color: PieceColor.BLACK },
            ],
        ],
        enPassant: null,
        castling: [true, true, true, true],
    }

    return startingChessboard;
}

function initialTileColor(): TileColor[][] {
    const initialBoard: TileColor[][] = [];
    for (let i = 0; i < 8; i++) {
        initialBoard.push(Array(8).fill(TileColor.NORMAL));
    }
    return initialBoard;
}

const verticalAxis: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function Chessboard(){
    const [previousPos, setPreviousPos] = useState<Position>({x: 0, y: 0});
    const chessboardRef = useRef<HTMLDivElement>(null);
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [pieces, setPieces] = useState<ChessboardState>(initializeChessboard());
    const moves = new Moves();
    const [piecesMoves, setPiecesMoves] = useState<PieceMoves[][]>([]);
    const [shownMovesPos, setShownMovesPos] = useState<Position | null>(null);
    const [tileColor, setTileColor] = useState<TileColor[][]>(initialTileColor())

    useEffect(() => {
        let tempPieceMoves: PieceMoves[][] | boolean = moves.generateAllLegalMoves(pieces, PieceColor.WHITE);
        if(typeof tempPieceMoves !== "boolean"){  
            setPiecesMoves(tempPieceMoves);
        }
      }, []);

    function grabPiece(e: React.MouseEvent) {
        const element = e.target as HTMLElement;
        const chessboard = chessboardRef.current;
        if(chessboard){
            const pos: Position | null = {x: Math.floor((e.clientX - chessboard.offsetLeft) / chessboard.clientWidth * 8), y: -Math.ceil((e.clientY - chessboard.offsetTop) / chessboard.clientHeight * 8 - 8)};
            if (element.classList.contains("chess-piece") && tileColor[pos.x][pos.y] === 0) {
                setPreviousPos(pos);
                showMoves(pos)
                setActivePiece(element);
                if (activePiece) {
                    const x = e.clientX - activePiece.clientWidth / 2;
                    const y = e.clientY - activePiece.clientHeight / 2;
                    activePiece.style.position = "absolute";
                    activePiece.style.left = `${x}px`;
                    activePiece.style.top = `${y}px`;
                }
            }else if(shownMovesPos && tileColor[pos.x][pos.y] === 0){
                showMoves(shownMovesPos);
            }
        }
    }

    function movePiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const minX = chessboard.offsetLeft - activePiece.clientWidth / 4;
            const minY = chessboard.offsetTop - activePiece.clientHeight / 4;
            const maxX = minX + chessboard.clientWidth - activePiece.clientWidth / 2;
            const maxY = minY + chessboard.clientHeight - activePiece.clientHeight / 2;

            let x = e.clientX - activePiece.clientWidth / 2;
            let y = e.clientY - activePiece.clientHeight / 2;

            x = Math.max(minX, Math.min(x, maxX));
            y = Math.max(minY, Math.min(y, maxY));

            activePiece.style.position = "absolute";
            activePiece.style.left = `${x}px`;
            activePiece.style.top = `${y}px`;
        }
    }

    function dropPiece(e: React.MouseEvent){
        const chessboard = chessboardRef.current;
        if(chessboard){
            const newPos: Position | null = {x: Math.floor((e.clientX - chessboard.offsetLeft) / chessboard.clientWidth * 8), y: -Math.ceil((e.clientY - chessboard.offsetTop) / chessboard.clientHeight * 8 - 8)};
            if(activePiece || (shownMovesPos!== null && (newPos.x !== shownMovesPos?.x || newPos.y !== shownMovesPos?.y))){
                if(shownMovesPos!== null && (newPos.x !== shownMovesPos?.x || newPos.y !== shownMovesPos?.y)){
                    setPreviousPos(shownMovesPos);
                }
                setPieces((value) => {
                    const piece: Piece | null = value.board[previousPos.x][previousPos.y];
                    const updatedPieces: ChessboardState = value;

                    if(piece && piecesMoves[previousPos.x][previousPos.y].moves?.some(move => move.x === newPos.x && move.y === newPos.y)){
                        updatedPieces.enPassant = null;
                        if(piece.type === PieceType.PAWN){
                            if((previousPos.y === 1 && newPos.y === 3) || (previousPos.y === 6 && newPos.y === 4)){
                                updatedPieces.enPassant = {x: newPos.x, y: newPos.y === 3 ? 2 : 5};
                            }
                            else if(previousPos.x !== newPos.x && updatedPieces.board[newPos.x][newPos.y] === null){
                                updatedPieces.board[newPos.x][newPos.y === 2 ? 3 : 4] = null;
                            }
                        }
                        updatedPieces.board[previousPos.x][previousPos.y] = null;
                        updatedPieces.board[newPos.x][newPos.y] = piece;
                        if(piece.type === PieceType.KING){
                            updatedPieces.castling[piece.color*2] = false;
                            updatedPieces.castling[piece.color*2+1] = false;
                        }
                        if(piece.type === PieceType.KING && previousPos.x + 2 === newPos.x){
                            let tempPiece: Piece | null = updatedPieces.board[7][newPos.y];
                            updatedPieces.board[7][newPos.y] = null;
                            updatedPieces.board[5][newPos.y] = tempPiece;
                        }
                        if(piece.type === PieceType.KING && previousPos.x - 2 === newPos.x){
                            let tempPiece: Piece | null = updatedPieces.board[0][newPos.y];
                            updatedPieces.board[0][newPos.y] = null;
                            updatedPieces.board[3][newPos.y] = tempPiece;
                        }
                        if(piece.type === PieceType.ROOK && (previousPos.x === 0 || previousPos.x === 7) && (previousPos.y === 0 || previousPos.y === 7)){
                            updatedPieces.castling[(previousPos.y/7 * 2) + 1 - (previousPos.x / 7)] = false;
                        }

                        let tempPieceMoves: PieceMoves[][] | boolean = moves.generateAllLegalMoves(pieces, piece.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE);
                        setTileColor(initialTileColor());
                        if(typeof tempPieceMoves !== "boolean"){  
                            setPiecesMoves(tempPieceMoves);
                        }
                        else{
                            if(tempPieceMoves){
                                console.log(piece.color === PieceColor.WHITE ? "WHITE WINS" : "BLACK WINS");
                            }else{
                                console.log("Draw")
                            }
                        }
                    }else if(activePiece){
                        activePiece.style.position = "relative";
                        activePiece.style.removeProperty("left");
                        activePiece.style.removeProperty("top");
                    }
                    return updatedPieces;
                });
                setActivePiece(null);
            }
        }
    }

    function showMoves(pos: Position){
        if(pos.x === shownMovesPos?.x && pos.y === shownMovesPos?.y){
            setShownMovesPos(null);
            setTileColor(initialTileColor());
        }else{  
            setShownMovesPos(pos);
            let tempTileColor: TileColor[][] = initialTileColor();
            piecesMoves[pos.x][pos.y].moves?.forEach(element => {
                if(pieces.board[element.x][element.y] !== null){    
                    tempTileColor[element.x][element.y] = TileColor.ATTACK;
                }
                else if(element.x === pieces.enPassant?.x && element.y === pieces.enPassant?.y && pieces.board[pos.x][pos.y]?.type === PieceType.PAWN){
                    tempTileColor[element.x][element.y] = TileColor.SPECIAL_MOVE;
                }
                else if(pieces.board[pos.x][pos.y]?.type === PieceType.PAWN && !(pos.y + 1 === element.y || pos.y -1 === element.y)){
                    tempTileColor[element.x][element.y] = TileColor.SPECIAL_MOVE;
                }
                else{
                    tempTileColor[element.x][element.y] = TileColor.MOVE;
                }
            });
            setTileColor(tempTileColor);
        }
    }

    function generateBoard() {
        let generatedBoard: React.ReactNode[] = [];

        for(let i = verticalAxis.length-1; i >= 0; i--){
            for(let j = 0; j < horizontalAxis.length; j++){
                let type: PieceType | undefined = pieces.board[j][i]?.type;
                let color: PieceColor | undefined = pieces.board[j][i]?.color;
                let tileC: TileColor = tileColor[j][i];

                generatedBoard.push(<Tile key={`${j},${i}`} number={j+i} tileColor={tileC} type={type} color={color}/>);
            }
        }

        return generatedBoard;
    }

    return (
        <div 
            onMouseDown={(e) => grabPiece(e)}
            onMouseMove={(e) => movePiece(e)}
            onMouseUp={(e) => dropPiece(e)}
            id="chessboard"
            ref={chessboardRef}
        >
            {generateBoard()}
        </div>
    );
}