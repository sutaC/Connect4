import { Player, checkDraw, checkGameOver, playMove } from "./board";

function splitArray<T>(array: T[], devider: T): T[][]{
    const result: T[][] = [];
    let segment: T[] = []
    for(let i = 0; i < array.length; i++){
        const val = array[i];
        if(val === devider){
            if(segment.length === 0) continue;
            result.push(segment);
            segment = []
            continue;
        }
       segment.push(val); 
    }
    return result;
}

function evalLine(board: Player[][], y: number, x: number, move: (y: number, x: number) => {nY: number, nX: number}): number {
    if(y < 0 || x < 0 || x >= board[0].length || y >= board.length) {
        throw new Error("Y or X out of scope") 
    }
    
    const line: Player[] = [];

	while(true){
        line.push(board[y][x]);
		const {nY, nX} = move(y, x);

		if(nY < 0 || nX < 0 || nX >= board[0].length || nY >= board.length) {
            break;
        }
		y = nY;
		x = nX;
	}

    if(!line.find((v) => v !== null)) return 0;

    const threadsR = splitArray(line, "yellow") as Player[][];
    const threadsY = splitArray(line, "red") as Player[][];

    let eva = 0;

    threadsR.forEach(thread => {
        if(thread.length >= 4){
            const filled = thread.filter(v => v !== null).length;
            if(filled >= 4) return 1000
            eva += filled * 2 + thread.length - filled
        }
    })
    
    threadsY.forEach(thread => {
        if(thread.length >= 4){
            const filled = thread.filter(v => v !== null).length;
            if(filled >= 4) return -1000
            eva -= filled * 2 + thread.length - filled
        }
    })

    return eva;
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
