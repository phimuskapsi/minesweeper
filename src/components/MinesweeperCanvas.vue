
<template>
    <div>
        <v-row align="center">
            <v-col cols="12">             
                <div class="gamefield" id="minefield"></div>  
            </v-col>
        </v-row>   
        <v-row align="center">
            <v-col cols="4" offset="4">  
                <v-btn color="primary" v-if="!running" v-on:click="startGame">Start Game</v-btn>
                <v-btn color="orange" v-if="running" v-on:click="solveGame">Solve</v-btn>
            </v-col>
        </v-row>
    </div>
</template>
<style scoped>
</style>
<script>
    import * as PIXI from 'pixi.js';
  export default {
    name: 'MinesweeperCanvas',

    data: () => ({
        Pixi: null,
        grids: {
            minefield: [],
            guesses: [],
            mines: [],
            mine_graphics: []
        },
        face: null,
        highscores: [],
        settings: {
            cols: 10,
            grid_size: 50,
            mines: 20,
            rows: 10,
            time: 0,            
            height: 0,
            width: 0
        },
        paused: false,            
        running: false,
        solved: false,
        timer: null,
    }),
    methods: {
        cellTest(x, y) {
            for (let ty = -1;ty<2; ty++) {
                for (let tx = -1;tx<2; tx++) {
                    let testX = x + tx;
                    let testY = y + ty;         
                    
                    if (testY < 0 || testX < 0 || testY >= this.settings.rows || testX >= this.settings.cols) continue;     
                    let tested = this.grids.minefield[testY][testX].value;
                    let visible = this.grids.minefield[testY][testX].visible;
                    // Skip OB tests                     

                    if (tested >= 0 && !visible) {
                        this.grids.mine_graphics[y][x].gameOptions.pressed = true;
                        this.grids.minefield[testY][testX].visible = true;
                        this.drawNumber(testX, testY);
                        
                        // Note to self: Can you create 'watcher' custom events? Or should we just draw

                        if(tested === 0 && !visible) {
                            this.cellTest(testX, testY);
                        }
                    }
                }
            }
        },
        drawCols () {
            let col = new PIXI.Graphics(), cx = 0;
            // Draw the cols
            for (let c=0;c<this.settings.cols;c++) {
                col.lineStyle({
                    width: 2,
                    color: 0x999999,
                    alignment: 0
                })
                .moveTo(cx, 0)    
                .lineTo(cx, this.settings.height);

                cx+=this.settings.grid_size;       
                this.Pixi.stage.addChild(col);         
            }
        },
        drawMines () {
            // Draw the minefield, we need to do this for event reasons
            for (let r=0;r<this.settings.rows;r++) {    
                for (let c=0;c<this.settings.cols;c++) {
                    let mine = new PIXI.Graphics();
                    let mineIn = new PIXI.Graphics();
                    mine
                        .lineStyle({
                            width:2, 
                            color: 0xbbbbbb, 
                            alpha: 1
                        })
                        .beginFill(0xD3D3D3, 1)
                        .drawRect(c * this.settings.grid_size, r * this.settings.grid_size, this.settings.grid_size, this.settings.grid_size)
                        .endFill();

                    mineIn
                        .lineStyle({
                            width:2, 
                            color: 0x666666, 
                            alpha: 1
                        })
                        .beginFill(0xefefef, 1)
                        .drawRect(c * this.settings.grid_size + 2, r * this.settings.grid_size + 2, this.settings.grid_size-4, this.settings.grid_size-4)
                        .endFill();

                    this.Pixi.stage.addChild(mine);
                    this.Pixi.stage.addChild(mineIn);
                    mineIn.interactive = true;
                    mineIn.hitArea = new PIXI.Rectangle(c * this.settings.grid_size + 2, r * this.settings.grid_size + 2, this.settings.grid_size-4, this.settings.grid_size-4);
                    mineIn.gameOptions = {
                        flag: 0,
                        pressed: false,
                        x: c,
                        y: r
                    };

                    mineIn.gameGraphics = {
                        mine: 
                            new PIXI.Graphics().lineStyle({
                                width:4, 
                                color: 0xcecece, 
                                alpha: 1,
                                alignment:0
                            })
                            .beginFill(0xbababa, 1)
                            .drawRect(c * this.settings.grid_size + 2, r * this.settings.grid_size + 2, this.settings.grid_size-4, this.settings.grid_size-4)
                            .endFill(),
                        flag: new PIXI.Graphics().lineStyle({
                                width:4, 
                                color: 0xffffff, 
                                alpha: 1,
                                alignment:0
                            })
                            .beginFill(0xbe1919, 1)
                            .drawRect(c * this.settings.grid_size + 2, r * this.settings.grid_size + 2, this.settings.grid_size-4, this.settings.grid_size-4)
                            .endFill(),
                        question: new PIXI.Graphics().lineStyle({
                                width:4, 
                                color: 0xffffff, 
                                alpha: 1,
                                alignment:0
                            })
                            .beginFill(0x3b3be8, 1)
                            .drawRect(c * this.settings.grid_size + 2, r * this.settings.grid_size + 2, this.settings.grid_size-4, this.settings.grid_size-4)
                            .endFill(),
                    };
                    // Can pass 'event/mouseData'
                    mineIn.mouseover = (event) => {                          
                        let self = event.currentTarget;       
                        if (self.gameOptions.flag === 0 && !self.gameOptions.pressed) {                                
                            this.Pixi.stage.addChild(self.gameGraphics.mine);
                        }
                    }
                    // Can pass 'event/mouseData'
                    mineIn.mouseout = (event) => {
                        let self = event.currentTarget;   
                        if (self.gameOptions.flag === 0 && !self.gameOptions.pressed) { 
                            this.Pixi.stage.removeChild(self.gameGraphics.mine);
                        }
                    }

                    mineIn.click = (event) => {
                        let self = event.currentTarget;
                        this.grids.mine_graphics[self.gameOptions.y][self.gameOptions.x].gameOptions.pressed = true;   
                        if (!this.lookupMine(self.gameOptions.x, self.gameOptions.y)) {
                            // Show the cell
                            this.findClearCells(self.gameOptions.x, self.gameOptions.y);
                        } else {
                            //
                            this.stopGame();
                            return;
                        }
                    }

                    mineIn.rightclick = (event) => {                        
                        let self = event.currentTarget;  
                        self.gameOptions.flag++;
                        if(self.gameOptions.flag > 2) self.gameOptions.flag = 0;

                        switch(self.gameOptions.flag) {
                            case 1: // is a flag
                                this.Pixi.stage.addChild(self.gameGraphics.flag);
                            break;
                            case 2: // is a question
                                this.Pixi.stage.removeChild(self.gameGraphics.flag);
                                this.Pixi.stage.addChild(self.gameGraphics.question);
                            break;
                            default: 
                                this.Pixi.stage.removeChild(self.gameGraphics.question);
                            break;
                        }
                    }

                    this.grids.mine_graphics[r][c] = mineIn;
                }
            }
        },
        drawNumber (x,y) {
            let number = null;
            let numberColors = [
                0x222222,
                0x85d0ff,
                0x9d85ff,
                0x34c96e,
                0xc98b34,
                0xc93461,
                0xc95234,
                0xff0000
            ];

            let cellValue = this.grids.minefield[y][x].value;
            let fontStyle = {
                font: '24px Courier, monospace',
                fill: cellValue >= 0 ? numberColors[(cellValue - 1)] : 0x000000
            }

            if(this.grids.minefield[y][x].bomb) {
                number = new PIXI.Text('B', fontStyle);   
            } else {
                if(cellValue > 0) {
                    number = new PIXI.Text(cellValue, fontStyle);
                } else {
                    this.Pixi.stage.addChild(this.grids.mine_graphics[y][x].gameGraphics.mine);
                    return;
                }
            }
            number.x = x * this.settings.grid_size + 18;
            number.y = y * this.settings.grid_size + 10;     
            this.grids.mine_graphics[y][x].gameOptions.pressed = true;       
            this.Pixi.stage.addChild(number);
        },
        drawRows () {
            let row = new PIXI.Graphics(), ry = 0;
             for (let r=0;r<this.settings.rows;r++) {     
                row.lineStyle({
                    width: 2,
                    color: 0x999999                
                })
                .moveTo(0, ry)         
                .lineTo(this.settings.width, ry);

                ry+=this.settings.grid_size;      
                this.Pixi.stage.addChild(row);                          
            }
        },
        drawGrid () {
            let grid = new PIXI.Graphics();           
            // Setup the background
            grid.drawRect(0, 0, this.settings.width, this.settings.height);
            this.Pixi.stage.addChild(grid);
            
            // Draw the rows            
            //this.drawRows();
            //this.drawCols();
            this.drawMines();
        },
        findClearCells(x, y){
            console.log(x + ' - ' + y);
            let cellVal = this.grids.minefield[y][x].value;

            // Since our targeted clicked cell is 0, let us see if any other contiguous 0's are around      
            if(cellVal === 0) {
                // Recursively check around the clicked area
                this.cellTest(x, y);
            } else {
                // Not a zero, so show it, whatever it may be.
                this.grids.minefield[y][x].visible = true;
                this.grids.mine_graphics[y][x].gameOptions.pressed = true;      
                this.drawNumber(x, y);
                 // Note to self: Can you create 'watcher' custom events? Or should we just draw
            }
        },
        getMine() {
            var minePosX = this.getRandom(this.settings.cols);
            var minePosY = this.getRandom(this.settings.rows);

            if (!this.grids.minefield[minePosY][minePosX].bomb) {
                this.grids.minefield[minePosY][minePosX].bomb = true;
            } else {
                this.getMine()
            }

            return { x: minePosX, y: minePosY };
        },      
        getRandom(max) {
            return Math.floor(Math.random() * max);
        }, 
        initGame() {
            this.grids.mine_graphics = [];
            this.grids.minefield = [];
            this.grids.guesses = [];
            this.grids.mines = [];

            this.solved = false;
            this.settings.cols = 10;
            this.settings.rows = 10;            
            this.settings.mines = 20;
            this.settings.time = 0;
            this.timer = null;
            
            this.timer = setInterval(() => {
                this.settings.time++;
            }, 1000);
            
            this.initGridData();
            this.drawGrid();            
            //this.createGame();
        }, 
        initGridData () {         
            for(var r=0;r<this.settings.rows;r++) {
                this.grids.minefield.push([]);
                this.grids.guesses.push([]);
                this.grids.mine_graphics.push([]);
                for(var c=0;c<this.settings.cols;c++) {
                    this.grids.minefield[r].push(
                        { 
                            value: 0, 
                            visible: false, 
                            bomb: false, 
                            exploded: false,
                            wrong: false 
                        }
                    );
                    this.grids.guesses[r].push(
                        {
                            flag: 0 
                        }
                    );

                    this.grids.mine_graphics[r].push(
                        { 
                            mine: null, 
                            flag: null,
                            question: null 
                        }
                    );
                }
            }   
            // Setup Mines
            for (let m=0;m < this.settings.mines; m++) {
                this.grids.mines.push(this.getMine());
            }

            // Setup Hints 
            for (let r = 0;r < this.settings.rows; r++) { 
                for (let c = 0;c < this.settings.cols; c++) { 
                    // Check each block individually... we are going to speed this up though.
                    // Check if the block is a mine to begin with, if it is, we don't want to increment anything
                    if(this.lookupMine(c,r)) continue;

                    // So we are not on a mine spot, time to check all nearby squares to this block
                    for (let ty = -1;ty<2; ty++) {
                        for (let tx = -1;tx<2; tx++) {
                            let testX = c + tx;
                            let testY = r + ty;

                            // If this is the same block that is being tested, continue
                            if(testX === c && testY === r) continue;                   
                            
                            // Our test is out of bounds, then continue
                            if(testY < 0 || testX < 0 || testY >= this.settings.rows || testX >= this.settings.cols) continue;

                            // Check to see if the tested location is a mine
                            // If it is, and the place we are incrementing is also not a mine, then increment initial block
                            if(this.lookupMine(testX, testY) && !this.lookupMine(c,r)) {
                                this.grids.minefield[r][c].value++;
                            }
                        }
                    }            
                }
            }        
            
        },
        lookupMine(x, y) {
            return this.grids.minefield[y][x].bomb;
        },
        solveGame () {
            var wrong = 0;

            for (let y=0;y<this.settings.rows;y++) {
                for (let x=0;x<this.settings.cols;x++) {            
                    var flag = this.grids.guesses[y][x].flag;
                    var found = false;

                    switch(flag) {
                    case 2:
                        // No guess marks allowed! Automatically wrong.
                        this.grids.minefield[y][x].wrong = true;
                        wrong++;
                    return;

                    case 1:
                        // Flag, check vs. mines
                        found = this.lookupMine(x, y);
                        if (!found) {
                            this.grids.minefield[y][x].wrong = true;
                            wrong++;
                        }
                    break;

                    case 0: 
                        // No flag, check if missed
                        found = this.lookupMine(x, y);
                        if (found) {
                            this.grids.minefield[y][x].wrong = true;
                            wrong++;
                        }
                    break;
                    }
                }
            }
    
            this.solved = (wrong === 0);
            this.stopGame();        
        },
        showEnd() {
            console.log('FINISH!');
        },
        stopGame () {
            if(!this.solved) {
                console.log("BOOM!");
            }
            this.running = false;
        },
        startGame () {
            this.running = true;        
        }
    },
    mounted() {
        this.settings.height = this.settings.grid_size * this.settings.rows;
        this.settings.width = this.settings.grid_size * this.settings.cols;

        this.Pixi = new PIXI.Application({
            transparent:false,
            antialias: true,
            backgroundColor: 0xcecece,
            height: this.settings.height,
            width: this.settings.width
        });        

        this.$el.querySelector('#minefield').appendChild(this.Pixi.view);        
        this.Pixi.renderer.view.style.display = "block";
        this.Pixi.renderer.autoResize = true;
        // w, h
        this.Pixi.renderer.resize(this.settings.width, this.settings.height);
        this.$el.querySelector('#minefield').addEventListener('contextmenu', e => {
            e.preventDefault();
        })

    },
     watch: {
      running: function(isRunning) {
            if(!isRunning) {
                clearInterval(this.timer);       
                this.showEnd();   
            } else {
                this.initGame();          
            }
        }
    }, 
  }

</script>