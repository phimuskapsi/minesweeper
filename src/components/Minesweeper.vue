<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">    
        <v-card>
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title class="text-h5">
                Minesweeper
              </v-list-item-title>
              <v-list-item-subtitle>Best Time: {{gameData.highscores.time}}</v-list-item-subtitle>
              <v-list-item-subtitle>Timer: {{gameData.time}}</v-list-item-subtitle>
            </v-list-item-content>            
          </v-list-item>
          <v-card-text>
            <v-row align="center">
              <v-col cols="12">                
                <v-simple-table v-if="gameData.grid.length > 0 && gameData.guessGrid.length > 0" class="game-table">
                  <template v-slot:default>
                    <tbody>
                      <tr v-for="(gridRow, rindex) in gameData.grid" :key="rindex + '-tr'">
                        <td v-for="(gridCol, cindex) in gridRow" :key="rindex + '-tr-' + cindex + '-td'" class="mine-button" 
                            v-on:click="clickCell(cindex, rindex)" 
                            v-on:click.right.prevent="markCell(cindex, rindex)"      
                            v-bind:class="(gameData.grid[rindex][cindex].visible || gameData.grid[rindex][cindex].exploded) ? (gameData.grid[rindex][cindex].exploded ? 'pressed dark-red' : 'pressed') : ''"                               
                            >
                            <span class="cell-text" v-bind:class="'cell-value-' + gameData.grid[rindex][cindex].value" v-if="gameData.grid[rindex][cindex].visible && gameData.grid[rindex][cindex].value > 0">
                              {{ gameData.grid[rindex][cindex].value }}
                            </span>                            
                            <span class="wrong-guess" v-if="!running && gameData.grid[rindex][cindex].wrong && !gameData.grid[rindex][cindex].bomb">
                              X
                            </span>      
                          <v-icon color="black" class="mine-icon-bk mine-icon" v-if="!running && gameData.grid[rindex][cindex].bomb && (gameData.grid[rindex][cindex].exploded || gameData.grid[rindex][cindex].wrong)">mdi-nuke</v-icon>                    
                          <v-icon color="red" class="mine-icon-fr mine-icon" v-if="!running && gameData.grid[rindex][cindex].bomb && (gameData.grid[rindex][cindex].exploded || gameData.grid[rindex][cindex].wrong)">mdi-nuke</v-icon>
                          <v-icon color="green" class="mine-icon" v-if="!running && gameData.grid[rindex][cindex].bomb && (!gameData.grid[rindex][cindex].exploded && !gameData.grid[rindex][cindex].wrong)">mdi-bomb</v-icon>
                          <v-icon color="red" class="mine-icon" v-if="(!running && gameData.guessGrid[rindex][cindex].flag === 1 && gameData.grid[rindex][cindex].wrong) || (running && gameData.guessGrid[rindex][cindex].flag === 1 && !gameData.grid[rindex][cindex].visible)">mdi-flag</v-icon>
                          <v-icon color="blue" class="mine-icon" v-if="running && gameData.guessGrid[rindex][cindex].flag === 2 && !gameData.grid[rindex][cindex].visible">mdi-crosshairs-question</v-icon>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="4" offset="4">  
                <v-btn color="primary" v-if="!running" v-on:click="startGame">Start Game</v-btn>
                <v-btn color="orange" v-if="running" v-on:click="solveGame">Solve</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
  .cell-text {
    font-weight: 800;
    font-size: 24px;
  }
  .cell-value-1 {
    color: cornflowerblue;
  }
  .cell-value-2 {
    color: olive;
  }
  .cell-value-3 {
    color: darkgreen;
  }
  .cell-value-4 {
    color: rgb(255, 123, 0);
  }
  .cell-value-5 {
    color: orangered;
  }
  .cell-value-6 {
    color: maroon;
  }
  .cell-value-7 {
    color: red;
  }
  .cell-value-8 {
    color: hotpink;
  }
  .game-table {
    width: 500px;
    height: 500px;
    margin-left: auto;
    margin-right: auto;
  }
  .hidden-icon {
    display: none;
  }
  .mine-button {
    background-color: lightgray;
    border: 5px outset #f7f6f6;    
    width: 50px !important;
    height: 50px !important;
    max-width: 50px !important;
    max-height: 50px !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    position: relative;
  }
  .mine-icon {
    z-index: 1001;
  }
  .mine-icon-bk {
    z-index: 1002;
    font-size: 26px !important;
    position: absolute !important;
    top:0;
    left:0;
    width: 40px;
    height:40px;
  }
  .mine-icon-fr {
    z-index:1003;
    position: absolute !important;
    top:2px !important;
    left:0;
    width: 40px;
    height:40px;
  }
  .mine-button:hover {
    background-color: lightgray;
    border: 5px inset #f7f6f6;
  }
  .pressed {
    border: 5px ridge #f7f6f6;   
  }
  .wrong-guess {
    position: absolute;
    top:0;
    left:0;
    text-align: center;
    width: 40px;
    height:40px;
    line-height: 40px;
    font-size: 40px;
    color: rgba(41, 159, 255, 0.493);
    z-index: 1000;
  }
</style>
<script>
  export default {
    name: 'Minesweeper',

    data: () => ({
      gameData: {
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
      },
      running: false
    }),
    methods: {
      cellTest(x, y) {
        for (let ty = -1;ty<2; ty++) {
          for (let tx = -1;tx<2; tx++) {
            let testX = x + tx;
            let testY = y + ty;            

            // Skip OB tests
            if (testY < 0 || testX < 0 || testY >= this.gameData.size || testX >= this.gameData.size) continue;         
            let tested = this.gameData.grid[testY][testX].value;
            let visible = this.gameData.grid[testY][testX].visible;

            if (tested >= 0 && !visible) {
              this.gameData.grid[testY][testX].visible = true;

              if(tested === 0 && !visible) {
                this.cellTest(testX, testY);
              }
            }
          }
        }
      }, 
      clickCell(x, y) {
        if (!this.running) return;
        if (this.lookupMine(x,y)) {          
          this.gameData.grid[y][x].exploded = true;
          this.solveGame();
        } else {
          this.findClearCells(x, y);
        }
      },                 
      createGame() {
        // Setup Mines
        for (let m=0;m < this.gameData.mines; m++) {
          this.gameData.mineLocs.push(this.getMine());
        }

        // Setup Hints 
        for (let r = 0;r < this.gameData.size; r++) { 
          for (let c = 0;c < this.gameData.size; c++) { 
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
                if(testY < 0 || testX < 0 || testY >= this.gameData.size || testX >= this.gameData.size) continue;

                // Check to see if the tested location is a mine
                // If it is, and the place we are incrementing is also not a mine, then increment initial block
                if(this.lookupMine(testX, testY) && !this.lookupMine(c,r)) {
                  this.gameData.grid[r][c].value++;
                }
              }
            }            
          }
        }        
      },    
      showEnd() {
        console.log('THE END!');
      },
      findClearCells(x, y){
        console.log(x + ' - ' + y);
        let cellVal = this.gameData.grid[y][x].value;

        // Since our targeted clicked cell is 0, let us see if any other contiguous 0's are around      
        if(cellVal === 0) {
          // Recursively check around the clicked area
          this.cellTest(x, y);
        } else {
          // Not a zero, so show it, whatever it may be.
          this.gameData.grid[y][x].visible = true;
        }
      },  
      getMine() {
        var minePosX = this.getRandom(this.gameData.size);
        var minePosY = this.getRandom(this.gameData.size);

        if (!this.gameData.grid[minePosY][minePosX].bomb) {
          this.gameData.grid[minePosY][minePosX].bomb = true;
        } else {
          this.getMine()
        }

        return { x: minePosX, y: minePosY };
      },      
      getRandom(max) {
        return Math.floor(Math.random() * max);
      },   
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
      }, 
      initGrid() {
        // Setup Grid
        // Have to build the arrays this way
        // Using .fill() will cause all of the values to be referenced rather than by value
        for(var r=0;r<this.gameData.size;r++) {
          this.gameData.grid.push([]);
           this.gameData.guessGrid.push([]);
          for(var c=0;c<this.gameData.size;c++) {
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
      },
      lookupMine(x, y) {
        return this.gameData.grid[y][x].bomb;
      },
      markCell(x, y) {
        if (!this.running) return;
        this.gameData.guessGrid[y][x].flag++;
       
        if (this.gameData.guessGrid[y][x].flag > 2) {
          this.gameData.guessGrid[y][x].flag = 0;         
        }        
      },
      solveGame () {
        var wrong = 0;

        for (let y=0;y<this.gameData.size;y++) {
          for (let x=0;x<this.gameData.size;x++) {            
            var flag = this.gameData.guessGrid[y][x].flag;
            var found = false;

            switch(flag) {
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
      },
      stopGame () {
        if(!this.gameData.solved) {
          console.log("BOOM!");
        }
        this.running = false;
      },
      startGame () {
        this.running = true;        
      }
    },
    watch: {
      running: function(isRunning) {
        if(!isRunning) {
          clearInterval(this.gameData.timer);       
          this.showEnd();   
        } else {
          this.initGame();          
        }
      }
    },  
    mounted() {
      this.initGrid();
    }
  }
</script>
