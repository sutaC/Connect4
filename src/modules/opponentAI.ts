import { Player, playMove } from "./board";

export default function playAIMove(board: Player[][], color: Player): Player[][] {
    let row: number;
    do {
        row = Math.floor(Math.random() * 6)
    } while(!playMove(board, row, color));
    return board;
}
