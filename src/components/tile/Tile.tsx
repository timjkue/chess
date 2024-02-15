import React from "react";
import "./Tile.css";

import pawn_w from "../../assets/images/pawn_w.png";
import knight_w from "../../assets/images/knight_w.png";
import bishop_w from "../../assets/images/bishop_w.png";
import rook_w from "../../assets/images/rook_w.png";
import queen_w from "../../assets/images/queen_w.png";
import king_w from "../../assets/images/king_w.png";

import pawn_b from "../../assets/images/pawn_b.png";
import knight_b from "../../assets/images/knight_b.png";
import bishop_b from "../../assets/images/bishop_b.png";
import rook_b from "../../assets/images/rook_b.png";
import queen_b from "../../assets/images/queen_b.png";
import king_b from "../../assets/images/king_b.png";
import { PieceColor, PieceType } from "../chessboard/Chessboard.tsx";

export enum TileColor{
    NORMAL,
    MOVE,
    SPECIAL_MOVE,
    ATTACK,
}

interface Props {
    elementKey: string;
    number: number;
    tileColor: TileColor;
    type: PieceType | undefined;
    color: PieceColor | undefined;
}

const images = [pawn_w, knight_w, bishop_w, rook_w, queen_w, king_w, pawn_b, knight_b, bishop_b, rook_b, queen_b, king_b];


export default function Tile({ elementKey, number, tileColor, type, color }: Props) {
    const isEven = number % 2 === 0;
    const imageIndex: number | null = (type !== undefined && color !== undefined) ? (type + color * 6) : null;

    let cName: string = "";

    if (isEven) {
        switch (tileColor) {
            case TileColor.NORMAL:
                cName = "normal-black-tile";
                break;
            case TileColor.MOVE:
                cName = "move-black-tile";
                break;
            case TileColor.SPECIAL_MOVE:
                cName = "special-move-black-tile";
                break;
            case TileColor.ATTACK:
                cName = "attack-black-tile";
                break;
            default:
                break;
        }
    } else {
        switch (tileColor) {
            case TileColor.NORMAL:
                cName = "normal-white-tile";
                break;
            case TileColor.MOVE:
                cName = "move-white-tile";
                break;
            case TileColor.SPECIAL_MOVE:
                cName = "special-move-white-tile";
                break;
            case TileColor.ATTACK:
                cName = "attack-white-tile";
                break;
            default:
                break;
        }
    }

    return (
        <div className={`tile ${cName}`} id={elementKey} >
            {imageIndex !== null && (
                <img src={images[imageIndex]} className="chess-piece" draggable={false} alt="Chess Piece" id={`${color},${type}`} />
            )}
        </div>
    );
}
/*import React from "react";
import "./Tile.css";
import bishopImage from "../../assets/images/bishop_b.png"; // Adjust the path as needed

interface Props {
    image?: number,
    number: number,
}

export default function Tile({number, image}: Props) {
    if (number % 2 === 0) {
        return (
            <div className="tile black-tile">
                <img src={bishopImage}/>
            </div>
        );
    } else {
        return <div className="tile white-tile">
            <img src={bishopImage}/>
        </div>;
    }
}*/