"use strict";
// import * as jquery from 'jquery';
var animations = [];
var Board = /** @class */ (function () {
    function Board(height, width) {
        this.height = 0;
        this.width = 0;
        this.board = [];
        this.turnCount = 0;
        this.isFlipped = false;
        this.playerColor = 'yellow';
        this.opponentColor = 'red';
        for (var i = 0; i < width; i++)
            this.board.push([]);
        this.height = height;
        this.width = width;
        this.isFlipped = false;
    }
    Board.prototype.add_player_piece = function (column) {
        if (this.board[column].length == this.height)
            return false;
        this.board[column].push(true);
        this.turnCount++;
        this.refresh_display();
        if (this.turnCount % 2 == 0)
            this.flip_board_animate();
        return true;
    };
    Board.prototype.flip_board = function () {
        this.isFlipped = !this.isFlipped;
        for (var _i = 0, _a = this.board; _i < _a.length; _i++) {
            var col = _a[_i];
            col = col.reverse();
        }
        this.board.reverse();
    };
    Board.prototype.convertPxToNum = function (style) {
        return parseInt(style.substr(0, style.length - 2));
    };
    Board.prototype.flip_board_animate = function () {
        var _this = this;
        var board = document.getElementById('game');
        // board.setAttribute('class', 'foo');
        //@ts-ignore
        var boardA = board.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(180deg)' }], 1000);
        boardA.onfinish = function (ev) { _this.refresh_display(); };
        for (var x = 0; x < this.width; x++) {
            var _loop_1 = function (y) {
                var pieces = document.getElementsByClassName("pos-" + x + "-" + y);
                if (pieces.length === 0)
                    return "continue";
                var piece = pieces[0];
                var startPx = this_1.convertPxToNum(piece.style.top);
                var endPx = (this_1.board[x].length - y - 1) * 100;
                //@ts-ignore
                var res = piece.animate([{ 'top': startPx + "px" }, { 'top': endPx + "px" }], { duration: 700, easing: 'ease-in' });
                res.onfinish = function (ev) { piece.setAttribute('style', "top:" + endPx + "px"); };
            };
            var this_1 = this;
            for (var y = 0; y < this.height; y++) {
                _loop_1(y);
            }
        }
        this.flip_board();
    };
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
    Board.prototype.swap_players = function () {
        var _a;
        for (var _i = 0, _b = this.board; _i < _b.length; _i++) {
            var x = _b[_i];
            for (var i = 0; i < x.length; i++)
                x[i] = !x[i];
        }
        _a = [this.opponentColor, this.playerColor], this.playerColor = _a[0], this.opponentColor = _a[1];
    };
    Board.prototype.generate_visual = function () {
        var _this = this;
        var board = (document.createElement('div'));
        var res = (document.createElement('img'));
        res.setAttribute('src', 'img/board.svg');
        res.setAttribute('class', 'overlay');
        board.appendChild(res);
        var columnsDiv = (document.createElement('div'));
        columnsDiv.setAttribute('class', 'cols');
        var columns = [];
        var _loop_2 = function (x) {
            var column = (document.createElement('div'));
            column.setAttribute('class', 'col');
            column.addEventListener('click', function (event) {
                var succeeded = _this.add_player_piece(x);
                if (!succeeded)
                    return;
                _this.swap_players();
            });
            for (var y = 0; y < this_2.board[x].length; y++) {
                var piece = (document.createElement('div'));
                piece.setAttribute('class', "coin " + (this_2.board[x][y] ? this_2.playerColor : this_2.opponentColor) + " pos-" + x + "-" + y);
                piece.setAttribute('style', "top: " + (this_2.height - y - 1) * 100 + "px");
                column.appendChild(piece);
            }
            columns.push(column);
        };
        var this_2 = this;
        for (var x = 0; x < this.width; x++) {
            _loop_2(x);
        }
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var column = columns_1[_i];
            columnsDiv.appendChild(column);
        }
        board.appendChild(columnsDiv);
        return board;
    };
    Board.prototype.check_win = function () {
        var potentials = [];
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var dxs = [-1, 0, 1];
                var dys = [-1, 0, 1];
                for (var _i = 0, dxs_1 = dxs; _i < dxs_1.length; _i++) {
                    var dx = dxs_1[_i];
                    for (var _a = 0, dys_1 = dys; _a < dys_1.length; _a++) {
                        var dy = dys_1[_a];
                        if (dx == 0 && dy == 0)
                            continue;
                        var cur = [];
                        for (var i = 0; i < 4; i++) {
                            if (this.board[x + dx * i] === undefined || this.board[x + dx * i][y + dy * i] === undefined) {
                                cur.push(undefined);
                            }
                            else {
                                cur.push([this.board[x + dx * i][y + dy * i], x + dx * i, y + dy * i]);
                            }
                        }
                        potentials.push(cur);
                    }
                }
            }
        }
        for (var _b = 0, potentials_1 = potentials; _b < potentials_1.length; _b++) {
            var p = potentials_1[_b];
            var works = true;
            var piece = void 0;
            var positions = [];
            for (var _c = 0, p_1 = p; _c < p_1.length; _c++) {
                var t = p_1[_c];
                if (t == undefined) {
                    works = false;
                    break;
                }
                else if (piece == undefined) {
                    piece = t[0];
                }
                if (t[0] != piece) {
                    works = false;
                    break;
                }
                positions.push([t[1], t[2]]);
            }
            if (works) {
                return [true, positions];
            }
        }
        return [false, []];
    };
    Board.prototype.refresh_display = function () {
        var visual = this.generate_visual();
        var board = document.getElementsByClassName('board')[0];
        board.innerHTML = "";
        board.appendChild(visual);
        var res = this.check_win();
        if (res[0]) {
            var status_1 = document.getElementById('status');
            status_1.innerText = (res[0] !== this.isFlipped ? "Player 2" : "Player 1") + " won!";
            for (var _i = 0, _a = res[1]; _i < _a.length; _i++) {
                var pos = _a[_i];
                console.log(pos);
                var pieces = document.getElementsByClassName("pos-" + pos[0] + "-" + pos[1]);
                console.log(pieces);
                var piece = pieces[0];
                piece.classList.add('winner_coin');
            }
            var cols = document.getElementsByClassName('col');
            for (var i = 0; i < cols.length; i++) {
                var x = cols.item(i);
                var t = x.cloneNode(true);
                x.parentNode.replaceChild(t, x);
            }
        }
    };
    return Board;
}());
var globalBoard = new Board(6, 7);
globalBoard.refresh_display();
