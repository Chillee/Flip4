let animations: any[] = [];

class Board {
    height: number = 0;
    width: number = 0;
    board: boolean[][] = [];
    turnCount: number = 0;
    isFlipped: boolean = false;
    playerColor: string = 'yellow';
    opponentColor: string = 'red';
    constructor(height: number, width: number) {
        for (let i = 0; i < width; i++)
            this.board.push([]);

        this.height = height;
        this.width = width;
        this.isFlipped = false;
    }
    add_player_piece(column: number): boolean {
        if (this.board[column].length == this.height) return false;
        this.board[column].push(true);
        this.turnCount++;
        if (this.refresh_display()) {
            return false;
        }
        if (this.turnCount % 2 == 0) {
            this.flip_board_animate();
            this.flip_board();
        }

        return true;
    }
    flip_board() {
        this.isFlipped = !this.isFlipped;
        for (let col of this.board) {
            col = col.reverse();
        }
        this.board.reverse();
    }
    private convertPxToNum(style: string): number {
        return parseInt(style.substr(0, style.length - 2));
    }

    flip_board_animate() {
        const board = <HTMLDivElement>document.getElementById('game');
        // board.setAttribute('class', 'foo');
        //@ts-ignore
        let boardA = board.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(180deg)' }], 1000);

        boardA.onfinish = (ev) => { this.refresh_display(); };
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let pieces = document.getElementsByClassName(`pos-${x}-${y}`);
                if (pieces.length === 0) continue;
                let piece = <HTMLDivElement>pieces[0];
                let startPx = this.convertPxToNum(piece.style.top!);
                let endPx = (this.board[x].length - y - 1) * 100;
                //@ts-ignore
                let res = piece.animate([{ 'top': `${startPx}px` }, { 'top': `${endPx}px` }], { duration: 700, easing: 'ease-in' });

                res.onfinish = (ev) => { piece.setAttribute('style', `top:${endPx}px`) };
            }
        }
    }
    // swap_players_copy(): Board {
    //     const result = new Board(this.height, this.width);
    //     let board: boolean[][] = JSON.parse(JSON.stringify(this.board));
    //     for (const x of board) {
    //         for (let i = 0; i < x.length; i++)
    //             x[i] = !x[i];
    //     }
    //     result.board = board;
    //     result.isFlipped = this.isFlipped;
    //     [result.playerColor, result.opponentColor] = [this.opponentColor, this.playerColor];
    //     return result;
    // }

    swap_players() {
        for (const x of this.board) {
            for (let i = 0; i < x.length; i++)
                x[i] = !x[i];
        }
        [this.playerColor, this.opponentColor] = [this.opponentColor, this.playerColor];
    }
    generate_visual() {
        let board = <HTMLDivElement>(document.createElement('div'));
        const res = <HTMLImageElement>(document.createElement('img'));
        res.setAttribute('src', 'img/board.svg');
        res.setAttribute('class', 'overlay');
        board.appendChild(res);
        let columnsDiv = <HTMLDivElement>(document.createElement('div'));
        columnsDiv.setAttribute('class', 'cols');

        let columns: HTMLDivElement[] = []
        for (let x = 0; x < this.width; x++) {
            let column = <HTMLDivElement>(document.createElement('div'));
            column.setAttribute('class', 'col');
            column.addEventListener('click', (event) => {
                let succeeded = this.add_player_piece(x);
                if (!succeeded) return;
                // this.check_win();
                this.swap_players();
            });

            for (let y = 0; y < this.board[x].length; y++) {
                let piece = <HTMLDivElement>(document.createElement('div'));
                piece.setAttribute('class', `coin ${this.board[x][y] ? this.playerColor : this.opponentColor} pos-${x}-${y}`);
                piece.setAttribute('style', `top: ${(this.height - y - 1) * 100}px`)
                column.appendChild(piece);
            }
            columns.push(column);
        }
        for (const column of columns) {
            columnsDiv.appendChild(column);
        }
        board.appendChild(columnsDiv);
        return board;
    }

    check_win(): [boolean, boolean, [number, number][]] {
        let potentials = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let dxs = [-1, 0, 1];
                let dys = [-1, 0, 1];
                for (const dx of dxs) {
                    for (const dy of dys) {
                        if (dx == 0 && dy == 0) continue;
                        let cur: (undefined | [boolean, number, number])[] = [];
                        for (let i = 0; i < 4; i++) {
                            if (this.board[x + dx * i] === undefined || this.board[x + dx * i][y + dy * i] === undefined) {
                                cur.push(undefined);
                            } else {
                                cur.push([this.board[x + dx * i][y + dy * i], x + dx * i, y + dy * i]);
                            }
                        }
                        potentials.push(cur);
                    }
                }
            }
        }
        for (const p of potentials) {
            let works = true;
            let piece;
            let positions: [number, number][] = [];
            for (const t of p) {
                if (t == undefined) {
                    works = false;
                    break;
                } else if (piece == undefined) {
                    piece = t[0];
                }
                if (t[0] != piece) {
                    works = false;
                    break;
                }
                positions.push([t[1], t[2]]);
            }
            if (works) {
                return [true, piece!, positions];
            }
        }
        return [false, false, []];
    }

    refresh_display(): boolean {
        let visual = this.generate_visual();
        let board = document.getElementsByClassName('board')![0];
        board.innerHTML = "";
        board.appendChild(visual);
        const res = this.check_win();
        if (res[0]) {
            let status = <HTMLDivElement>document.getElementById('status');
            status.innerText = `${res[1] ? this.playerColor : this.opponentColor} won!`;
            for (const pos of res[2]) {
                console.log(pos);
                let pieces = document.getElementsByClassName(`pos-${pos[0]}-${pos[1]}`);
                console.log(pieces);
                let piece = pieces[0];
                piece.classList.add('winner_coin');
            }
            let cols = document.getElementsByClassName('col');
            for (let i = 0; i < cols.length; i++) {
                let x = cols.item(i);
                let t = x.cloneNode(true);
                x.parentNode!.replaceChild(t, x);
            }
            return true;
        }
        return false;
    }
}

let globalBoard = new Board(6, 7);
globalBoard.refresh_display();