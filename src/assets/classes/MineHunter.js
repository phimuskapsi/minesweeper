class MineHunterGame {
    constructor() {
        this.running = false
        this.timer = null;
        this.gameData = {
            mines: 20,
            mineLocs: [],
            size: 10,
            grid: [],
            guessGrid: [],
            highscores: {
                time: 60
            },
            time: 0,
            timer: null,
            face: null,
            paused: false,
            solved: false
        }
    }

    cellTest(x, y) {
        for (let ty = -1; ty < 2; ty++) {
            for (let tx = -1; tx < 2; tx++) {
                let testX = x + tx;
                let testY = y + ty;

                // Skip OB tests
                if (testY < 0 || testX < 0 || testY >= this.gameData.size || testX >= this.gameData.size) continue;
                let tested = this.gameData.grid[testY][testX].value;
                let visible = this.gameData.grid[testY][testX].visible;

                if (tested >= 0 && !visible) {
                    this.gameData.grid[testY][testX].visible = true;

                    if (tested === 0 && !visible) {
                        this.cellTest(testX, testY);
                    }
                }
            }
        }
    }

    clickCell(x, y) {
        if (!this.running) return;
        if (this.lookupMine(x, y)) {
            this.gameData.grid[y][x].exploded = true;
            this.solveGame();
        } else {
            this.findClearCells(x, y);
        }
    }

    createGame() {
        // Setup Mines
        for (let m = 0; m < this.gameData.mines; m++) {
            this.gameData.mineLocs.push(this.getMine());
        }

        // Setup Hints 
        for (let r = 0; r < this.gameData.size; r++) {
            for (let c = 0; c < this.gameData.size; c++) {
                // Check each block individually... we are going to speed this up though.
                // Check if the block is a mine to begin with, if it is, we don't want to increment anything
                if (this.lookupMine(c, r)) continue;

                // So we are not on a mine spot, time to check all nearby squares to this block
                for (let ty = -1; ty < 2; ty++) {
                    for (let tx = -1; tx < 2; tx++) {
                        let testX = c + tx;
                        let testY = r + ty;

                        // If this is the same block that is being tested, continue
                        if (testX === c && testY === r) continue;

                        // Our test is out of bounds, then continue
                        if (testY < 0 || testX < 0 || testY >= this.gameData.size || testX >= this.gameData.size) continue;

                        // Check to see if the tested location is a mine
                        // If it is, and the place we are incrementing is also not a mine, then increment initial block
                        if (this.lookupMine(testX, testY) && !this.lookupMine(c, r)) {
                            this.gameData.grid[r][c].value++;
                        }
                    }
                }
            }
        }
    }

    findClearCells(x, y) {
        console.log(x + ' - ' + y);
        let cellVal = this.gameData.grid[y][x].value;

        // Since our targeted clicked cell is 0, let us see if any other contiguous 0's are around      
        if (cellVal === 0) {
            // Recursively check around the clicked area
            this.cellTest(x, y);
        } else {
            // Not a zero, so show it, whatever it may be.
            this.gameData.grid[y][x].visible = true;
        }
    }

    getMine() {
        var minePosX = this.getRandom(this.gameData.size);
        var minePosY = this.getRandom(this.gameData.size);

        if (!this.gameData.grid[minePosY][minePosX].bomb) {
            this.gameData.grid[minePosY][minePosX].bomb = true;
        } else {
            this.getMine()
        }

        return { x: minePosX, y: minePosY };
    }

    getRandom(max) {
        return Math.floor(Math.random() * max);
    }

    initGame() {
        this.gameData.grid = [];
        this.gameData.guessGrid = [];
        this.gameData.mineLocs = [];

        this.gameData.solved = false;
        this.gameData.size = 10;
        this.gameData.mines = 20;
        this.gameData.time = 0;
        this.gameData.timer = null;

        this.gameData.timer = setInterval(() => {
            this.gameData.time++;
        }, 1000);

        this.initGrid();
        this.createGame();
    }

    initGrid() {
        // Setup Grid
        // Have to build the arrays this way
        // Using .fill() will cause all of the values to be referenced rather than by value
        for (var r = 0; r < this.gameData.size; r++) {
            this.gameData.grid.push([]);
            this.gameData.guessGrid.push([]);
            for (var c = 0; c < this.gameData.size; c++) {
                this.gameData.grid[r].push(
                    {
                        value: 0,
                        visible: false,
                        bomb: false,
                        exploded: false,
                        wrong: false
                    }
                );
                this.gameData.guessGrid[r].push(
                    {
                        flag: 0
                    }
                );
            }
        }
    }

    lookupMine(x, y) {
        return this.gameData.grid[y][x].bomb;
    }

    markCell(x, y) {
        if (!this.running) return;
        this.gameData.guessGrid[y][x].flag++;

        if (this.gameData.guessGrid[y][x].flag > 2) {
            this.gameData.guessGrid[y][x].flag = 0;
        }
    }

    showEnd() {
        console.log('THE END!');
    }

    solveGame() {
        var wrong = 0;

        for (let y = 0; y < this.gameData.size; y++) {
            for (let x = 0; x < this.gameData.size; x++) {
                var flag = this.gameData.guessGrid[y][x].flag;
                var found = false;

                switch (flag) {
                    case 2:
                        // No guess marks allowed! Automatically wrong.
                        this.gameData.grid[y][x].wrong = true;
                        wrong++;
                        return;

                    case 1:
                        // Flag, check vs. mines
                        found = this.lookupMine(x, y);
                        if (!found) {
                            this.gameData.grid[y][x].wrong = true;
                            wrong++;
                        }
                        break;

                    case 0:
                        // No flag, check if missed
                        found = this.lookupMine(x, y);
                        if (found) {
                            this.gameData.grid[y][x].wrong = true;
                            wrong++;
                        }
                        break;
                }
            }
        }

        this.gameData.solved = (wrong === 0);
        this.stopGame();
    }
    
    stopGame() {
        if (!this.gameData.solved) {
            console.log("BOOM!");
        }
        this.running = false;
    }
    startGame() {
        this.running = true;
    }
}