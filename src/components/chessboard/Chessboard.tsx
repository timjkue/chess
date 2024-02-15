import React, {useRef, useState, useEffect, ReactNode } from "react";
import Tile, { TileColor } from "../tile/Tile.tsx"
import "./Chessboard.css";
import Moves, { PieceMoves } from "../moves/Moves.ts";
import Bot from "../bot/Bot.ts"

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
    color: PieceColor;
    fullMove: number;
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
        color: PieceColor.WHITE,
        fullMove: 1,
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
    const previousPos = useRef<Position>({x: 0, y: 0});
    const chessboardRef = useRef<HTMLDivElement>(null);
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [pieces, setPieces] = useState<ChessboardState>(initializeChessboard());
    const movesRef = useRef<Moves>(new Moves());
    const botRef = useRef<Bot>(new Bot());
    const piecesMoves = useRef<PieceMoves[][]>([]);
    const shownMovesPos = useRef<Position | null>(null);
    const [tileColor, setTileColor] = useState<TileColor[][]>(initialTileColor())
    const ownColor = PieceColor.WHITE;
    const [gameEnded, setGameEnded] = useState<Boolean | undefined>(undefined);
    const lastPiece = useRef<{piece: Piece, pos: Position}>({piece: {type: 3, color: 1}, pos: {x: 0, y: 7}});
    const [update, setUpdate] = useState<number>(0);

    useEffect(() => {
        let tempPieceMoves: PieceMoves[][] | boolean = movesRef.current.generateAllLegalMoves(pieces);
        if(typeof tempPieceMoves !== "boolean"){  
            piecesMoves.current = tempPieceMoves;
        }
    }, []);

    useEffect(() => {
        getOpponentMove();
    })

    function grabPiece(e: React.MouseEvent) {
        const element = e.target as HTMLElement;
        const chessboard = chessboardRef.current;
        if(chessboard){
            const pos: Position = {x: Math.floor((e.clientX - chessboard.offsetLeft) / chessboard.clientWidth * 8), y: -Math.ceil((e.clientY - chessboard.offsetTop) / chessboard.clientHeight * 8 - 8)};
            if (element.classList.contains("chess-piece") && tileColor[pos.x][pos.y] === 0) {
                previousPos.current = pos;
                showMoves(pos)
                setActivePiece(element);
                if (activePiece) {
                    const x = e.clientX - activePiece.clientWidth / 2;
                    const y = e.clientY - activePiece.clientHeight / 2;
                    activePiece.style.position = "absolute";
                    activePiece.style.left = `${x}px`;
                    activePiece.style.top = `${y}px`;
                }
            }else if(shownMovesPos.current && tileColor[pos.x][pos.y] === 0){
                showMoves(shownMovesPos.current);
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
            if(activePiece || (shownMovesPos.current!== null && (newPos.x !== shownMovesPos.current?.x || newPos.y !== shownMovesPos.current?.y))){
                let oldPos: Position  = { x: 0, y: 0 };
                if(shownMovesPos.current!== null && (newPos.x !== shownMovesPos.current?.x || newPos.y !== shownMovesPos.current?.y)){
                    oldPos = shownMovesPos.current;
                }
                else{
                    oldPos = previousPos.current;
                }
                handleMove(oldPos, newPos);
            }
        }
    }

    function handleMove(pos1: Position, pos2: Position){
        const newChessboard: ChessboardState | null = move(pos1, pos2, pieces, piecesMoves.current);
        if(newChessboard !== null){
            setPieces(newChessboard);
            lastPiece.current = {piece: newChessboard.board[pos2.x][pos2.y]!, pos: pos2};
            let tempPieceMoves: PieceMoves[][] | boolean = movesRef.current.generateAllLegalMoves(pieces);
            setTileColor(initialTileColor());
            if(typeof tempPieceMoves !== "boolean"){  
                piecesMoves.current = tempPieceMoves;
            }
            else{
                if(tempPieceMoves){
                    setGameEnded(pieces.color === PieceColor.BLACK);
                    console.log(pieces.color === PieceColor.WHITE ? "BLACK WINS" : "WHITE WINS");
                }else{
                    console.log("Draw")
                }
            }
        }
        if(activePiece){
            activePiece.style.position = "relative";
            activePiece.style.removeProperty("left");
            activePiece.style.removeProperty("top");
        }
        setActivePiece(null);
    }

    function move(pos1: Position, pos2: Position, chessboard: ChessboardState, moves: PieceMoves[][]): ChessboardState | null{
        const piece: Piece | null = chessboard.board[pos1.x][pos1.y];
        const updatedPieces: ChessboardState = chessboard;

        if(piece && piecesMoves.current[pos1.x][pos1.y].moves?.some(move => move.x === pos2.x && move.y === pos2.y)){
            updatedPieces.enPassant = null;
            if(piece.type === PieceType.PAWN){
                if((pos1.y === 1 && pos2.y === 3) || (pos1.y === 6 && pos2.y === 4)){
                    updatedPieces.enPassant = {x: pos2.x, y: pos2.y === 3 ? 2 : 5};
                }
                else if(pos1.x !== pos2.x && updatedPieces.board[pos2.x][pos2.y] === null){
                    updatedPieces.board[pos2.x][pos2.y === 2 ? 3 : 4] = null;
                }
            }
            updatedPieces.board[pos1.x][pos1.y] = null;
            updatedPieces.board[pos2.x][pos2.y] = piece;
            if(piece.type === PieceType.PAWN && pos2.y === 7-piece.color*7){
                updatedPieces.board[pos2.x][pos2.y]!.type = PieceType.QUEEN;
            }
            if(piece.type === PieceType.KING){
                updatedPieces.castling[piece.color*2] = false;
                updatedPieces.castling[piece.color*2+1] = false;
            }
            if(piece.type === PieceType.KING && pos1.x + 2 === pos2.x){
                let tempPiece: Piece | null = updatedPieces.board[7][pos2.y];
                updatedPieces.board[7][pos2.y] = null;
                updatedPieces.board[5][pos2.y] = tempPiece;
            }
            if(piece.type === PieceType.KING && pos1.x - 2 === pos2.x){
                let tempPiece: Piece | null = updatedPieces.board[0][pos2.y];
                updatedPieces.board[0][pos2.y] = null;
                updatedPieces.board[3][pos2.y] = tempPiece;
            }
            if(piece.type === PieceType.ROOK && (pos1.x === 0 || pos1.x === 7) && (pos1.y === 0 || pos1.y === 7)){
                updatedPieces.castling[(pos1.y/7 * 2) + 1 - (pos1.x / 7)] = false;
            }
            updatedPieces.color = updatedPieces.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE
            if(updatedPieces.color === PieceColor.WHITE){
                updatedPieces.fullMove ++;
            }
            return updatedPieces;
        }
        return null;
    }

    function getOpponentMove(){
        if(pieces.color !== ownColor){
            if(chessboardRef.current?.children){
                for (let i = 0; i < chessboardRef.current?.children.length; i++) {
                    const element = chessboardRef.current?.children[i] as HTMLElement;
                    if (element.id === `${lastPiece.current.pos.x},${lastPiece.current.pos.y}`) {
                        if(element.firstElementChild?.id === `${lastPiece.current.piece.color},${lastPiece.current.piece.type}` && update >= 5){
                            let {pos1, pos2} = botRef.current.getBotMove(piecesMoves.current, pieces); 
                            handleMove(pos1, pos2);
                            setUpdate(0);
                        }else{
                            setUpdate(update + 1);
                        }
                    }
                }
            }
        }
    }

    function showMoves(pos: Position){
        if(pos.x === shownMovesPos.current?.x && pos.y === shownMovesPos.current?.y){
            shownMovesPos.current = null;
            setTileColor(initialTileColor());
        }else{  
            shownMovesPos.current = pos;
            let tempTileColor: TileColor[][] = initialTileColor();
            piecesMoves.current[pos.x][pos.y].moves?.forEach(element => {
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

                generatedBoard.push(<Tile key={`${j},${i}`} elementKey={`${j},${i}`} number={j+i} tileColor={tileC} type={type} color={color}/>);
            }
        }
        return generatedBoard;
    }

    function renderOverlay() {
        if (gameEnded !== undefined) {
            return (
                <div className="winner-overlay-container">
                    <div className="winner-overlay">
                        <div className="winner-overlay-content">
                            <h2>{gameEnded ? "WHITE WON" : "BLACK WON"}</h2>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <div>
            <div 
                onMouseDown={(e) => grabPiece(e)}
                onMouseMove={(e) => movePiece(e)}
                onMouseUp={(e) => dropPiece(e)}
                id="chessboard"
                ref={chessboardRef}
            >
                {generateBoard()}
            </div>
            {renderOverlay()}
        </div>
    );
}