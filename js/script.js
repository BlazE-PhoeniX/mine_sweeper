"use strict";

const containerBoard = document.querySelector(".table tbody");
const bombPopup = document.querySelector(".bomb-popup");
const partyPopup = document.querySelector(".party-popup");
const dialogPopup = document.querySelector(".dialog-popup");
const popupBG = document.querySelector(".popup-bg");
const playAgainBtn = document.querySelector(".dialog-popup button");
let tileBoxes;

class Tile {
    constructor() {
        this.nearByBombs = 0;
        this.isBomb = false;
        this.opened = false;
    }
}

class Board {
    constructor() {
        this.noOfBombs = 0;
        this.totalOpened = 0;
        this.gameOver = false;

        this.getSize();
        this.initBoard();
        this.plantBombs();
    }

    getSize() {
        let winWidth = document.documentElement.clientWidth;
        let winHeight = document.documentElement.clientHeight - 150;

        let shortSide = Math.min(winHeight - 150, winWidth - 100);

        let boxSize = winWidth < 500 ? 30 : winWidth < 1000 ? 40 : 45;

        this.size = Math.floor(shortSide / boxSize);
    }

    initBoard() {
        this.tiles = [];
        tileBoxes = [];

        containerBoard.innerHTML = "";

        for (let row = 0; row < this.size; row++) {
            this.tiles.push([]);

            let tableRow = document.createElement("tr");
            tableRow.classList.add("table-row", `table-row-${row}`);
            containerBoard.insertAdjacentElement("beforeend", tableRow);

            for (let col = 0; col < this.size; col++) {
                this.tiles[row].push(new Tile());
                tableRow.insertAdjacentHTML(
                    "beforeend",
                    `<td class="table-box table-box-${row}${col}" data-row=${row} data-col=${col}></td>`
                );
            }
            tileBoxes[row] = [...tableRow.querySelectorAll(".table-box")];
        }
    }

    plantBombs() {
        this.noOfBombs = Math.floor(this.size * this.size) / 4;
        for (let i = 0; i < this.noOfBombs; ) {
            let row = Math.floor(Math.random() * this.size);
            let column = Math.floor(Math.random() * this.size);
            let tile = this.tiles[row][column];

            if (tile.isBomb) continue;

            tile.isBomb = true;
            i++;
        }
    }

    openTile(event) {
        let row = +event.target.dataset.row;
        let col = +event.target.dataset.col;

        if (this.tiles[row][col].isBomb) {
            this.printLose();
        } else {
            this.checkTile(row, col);
            this.checkWin();
        }
    }

    checkValidTile(row, column) {
        return row >= 0 && row < this.size && column >= 0 && column < this.size;
    }

    printLose() {
        showPopup(bombPopup);
        setDialog("OOPS!! You hit a Bomb<br><span class='emoji'>☠️</span>");

        setTimeout(function () {
            hidePopup(bombPopup);
            showPopup(dialogPopup);
        }, 2000);
        this.gameOver = true;
    }

    checkWin() {
        if (this.size * this.size - this.noOfBombs == this.totalOpened) {
            showPopup(partyPopup);
            setDialog(
                "Hurray!! All mines cleared<br><span class='emoji'>🥳</span>"
            );
            setTimeout(function () {
                hidePopup(partyPopup);
                showPopup(dialogPopup);
            }, 1500);
            this.gameOver = true;
        }
    }

    getNearbyBombs(row, col) {
        let neighbors = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ];
        let bombs = 0;

        for (let neighbor of neighbors) {
            let r = row + neighbor[0];
            let c = col + neighbor[1];

            if (this.checkValidTile(r, c) && this.tiles[r][c].isBomb) {
                bombs++;
            }
        }

        return bombs;
    }

    checkNeigbours(row, col) {
        // Prettier ignore
        let neighbors = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [(1, 1)],
        ];

        for (let neighbor of neighbors) {
            let r = row + neighbor[0];
            let c = col + neighbor[1];

            if (this.checkValidTile(r, c) && !this.tiles[r][c].opened) {
                this.checkTile(r, c);
            }
        }
    }

    checkTile(row, col) {
        if (!this.tiles[row][col].opened) {
            this.tiles[row][col].opened = 1;
            this.totalOpened++;

            this.tiles[row][col].nearByBombs = this.getNearbyBombs(row, col);

            tileBoxes[row][col].textContent = this.tiles[row][col].nearByBombs;

            if (this.tiles[row][col].nearByBombs == 0) {
                tileBoxes[row][col].textContent = "";
                tileBoxes[row][col].style.background = "transparent";
                tileBoxes[row][col].style.boxShadow = "none";
                this.checkNeigbours(row, col);
            }
        }
    }

    getBombs() {
        let bombs = "";
        for (let row of this.tiles) {
            for (let tile of row) {
                bombs += tile.isBomb ? "1 " : "0 ";
            }
            bombs += "\n";
        }
        return bombs;
    }
}

let board, touchfunc;

function startGame() {
    board = new Board();
    touchfunc = board.openTile.bind(board);
    containerBoard.addEventListener("click", touchfunc);
    console.log(board.getBombs());
}

startGame();

function showPopup(popup) {
    popupBG.classList.remove("hide");
    popup.classList.remove("hide");
}

function hidePopup(popup) {
    popupBG.classList.add("hide");
    popup.classList.add("hide");
}

function setDialog(dialog) {
    dialogPopup.querySelector("p").innerHTML = dialog;
}

playAgainBtn.addEventListener("click", function () {
    containerBoard.removeEventListener("click", touchfunc);
    hidePopup(dialogPopup);
    startGame();
});
