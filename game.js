gameState = {
    // Game State singleton. Access and change things like score,
    // current location, and available powerups here.
    // Global-like access, but slightly safer than plain global vars.
    jerboaMinigame : {
        score : 0
    },
    inventory : {},
    timer : { state : "false", secondsLeft : 0, interval : null}
}

function initGame () {
    window.onresize = changeGameSize();
    jerboaGame.makeNewJerboaBoard(4);
    jerboaGame.startTimer(300);
}

jerboaGame = {
    // Jerboa game class. All code and scripts for the jerboa game in here.
    EXTRA_CELLS : 2,
    tableCells : null,
    makeNewJerboaBoard: function (cellsAcross) {
        var board = document.getElementById("jerboa_board");

        var cellWidth = 100 / cellsAcross;
        var cellWidthString = cellWidth + "%"; 
        var stylesheet = document.styleSheets[0]
        stylesheet.insertRule("#jerboa_board .jerboa {width:"+cellWidthString+"; height:" +cellWidthString + ";}");

        var lastTableCell = null;

        this.tableCells = [];
        for (var i = 0; i < cellsAcross + 2 * this.EXTRA_CELLS; i++) {
            var tableCellRow = [];
            this.tableCells.push(tableCellRow);
            if ( i >= this.EXTRA_CELLS && i < (this.EXTRA_CELLS + cellsAcross)) {
                for (var j = 0; j < cellsAcross + 2 * this.EXTRA_CELLS; j++) {
                    var tableObject = null;
                    if (j >= this.EXTRA_CELLS && j < (this.EXTRA_CELLS + cellsAcross)) {
                        var tableObject = document.createElement("div");
                        tableObject.setAttribute("class","jerboa");
                        tableObject.setAttribute("name",(i-this.EXTRA_CELLS) + "-" + (j-this.EXTRA_CELLS));
                        tableObject.style.top = ((i-this.EXTRA_CELLS) * cellWidth ) + "%";
                        tableObject.style.left = ((j-this.EXTRA_CELLS) * cellWidth ) + "%";
                        board.appendChild(tableObject);
                        lastTableCell = tableObject;
                        tableObject.onclick = this.jerboaClicked;
                    }
                    this.tableCells[i].push(tableObject);
                }
            }
        }
    },

    jerboaClicked: function (e) {
        window.console.log(e.target.attributes.name);
        e.target.style.display = "none";
    },

    advanceTimer: function () {
        gameState.timer.secondsLeft -= 1;
        jerboaGame.displayTimer();
        if (gameState.timer.secondsLeft <= 0) {
            jerboaGame.timerRanOut();
        }
    },

    displayTimer: function () {
        var minutesLeft = Math.floor(gameState.timer.secondsLeft / 60);
        var remainderSecondsLeft = gameState.timer.secondsLeft % 60;
        if (remainderSecondsLeft < 10) {
            remainderSecondsLeft = "0" + remainderSecondsLeft;
        }
        document.getElementById("jerboa_timer").innerHTML = minutesLeft + ":" + remainderSecondsLeft;
    },

    timerRanOut: function () {
        gameState.timer.state = false;
        window.clearInterval(gameState.timer.interval);
    },

    startTimer: function (seconds) {
        gameState.timer.state = true;
        gameState.timer.secondsLeft = seconds;
        gameState.timer.interval = window.setInterval(jerboaGame.advanceTimer,1000);
        this.displayTimer();
    }
}

function changeGameSize() {
    // Check to see what the new window dimensions are.
    // If fullscreen, resize for fullscreen.
    // Otherwise, if smaller than 1280x720, resize for the minimum
    // dimensions of 550x310, or 1280x720 if there is enough space.
    // TODO: Implement above in a platform-agnostic way.
}
