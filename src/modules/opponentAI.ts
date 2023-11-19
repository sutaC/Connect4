import { Player, checkDraw, checkGameOver, playMove } from "./board";

function evalLine(board: Player[][], y: number, x: number, move: (y: number, x: number) => {nY: number, nX: number}): number {
    if(y < 0 || x < 0 || x >= board[0].length || y >= board.length) {
        throw new Error("Y or X out of scope") 
    }
    
    let count = 0;
    let eva = 0;

	while(true){
		const {nY, nX} = move(y, x);

		if(nY < 0 || nX < 0 || nX >= board[0].length || nY >= board.length) {
            const factor = board[y][x] === "red" ? 1 : -1;
            eva += count * factor; 
            return eva;
        }
		
        const val = board[y][x]

        if(val === board[nY][nX] && board[y][x] !== null){
            count++;
        } else {
            const factor = val === "red" ? 1 : -1;
            eva += count * factor; 
            count = 0
        }

		if(count >= 3) return 1000

		y = nY;
		x = nX;
	}
}

function evaluateGame(board: Player[][]): number{
    if(checkDraw(board)) return 0;
    
    let eva = 0;

    {
		// Horizontal
		for(let y = 0; y < board.length; y++){
            eva += evalLine(board, y, 0, (y, x) => {return {nY: y, nX: x+1}})
		}
	}
	
	{
        // Vertical
		for(let x = 0; x < board[0].length; x++){
            eva += evalLine(board, 0, x, (y, x) => {return {nY: y+1, nX: x}})
		}
	}

    {
		// Diagonals
		for(let x = 0; x < board[0].length; x++){
			// DownRight
			eva += evalLine(board, 0, x, (y, x) => {return {nY: y+1, nX: x+1}})

			// DownLeft
			eva += evalLine(board, 0, x, (y, x) => {return {nY: y+1, nX: x-1}})
		}

		for(let x = 0; x < board[0].length; x++){
			// UpRight
			eva += evalLine(board, board.length - 1, x, (y, x) => {return {nY: y-1, nX: x+1}})

			// UpLeft
			eva += evalLine(board, board.length - 1, x, (y, x) => {return {nY: y-1, nX: x-1}})
		}
	}

    return eva;
}


export default function playAIMove(board: Player[][], color: Player): Player[][] {
    let row: number;
    do {
        row = Math.floor(Math.random() * 6)
    } while(!playMove(board, row, color));

    console.log(evaluateGame(board));

    return board;
}
