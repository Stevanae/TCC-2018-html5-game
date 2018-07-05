gameState = {
    // Game State singleton. Access and change things like score,
    // current location, and available powerups here.
    // Global-like access, but slightly safer than plain global vars.
    jerboaMinigame : {
        score : 0
    },
    inventory : {},
    timer : { state : "false", secondsLeft : 0, interval : null},
    chainInProgress : false
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
    jerboasByName : {},
    currentJerboaMoveChain : null,
    currentJerboaMoveChainNode : null,
    makeNewJerboaBoard: function (cellsAcross) {
        var board = document.getElementById("jerboa_board");

        var cellWidth = 100 / cellsAcross;
        var cellWidthString = cellWidth + "%"; 
        var stylesheet = document.styleSheets[0]
        stylesheet.insertRule("#jerboa_board .jerboa {width:"+cellWidthString+"; height:" +cellWidthString + ";}");

        this.tableCells = [];
        for (var i = 0; i < cellsAcross + 2 * this.EXTRA_CELLS; i++) {
            var tableCellRow = [];
            this.tableCells.push(tableCellRow);
            if ( i >= this.EXTRA_CELLS && i < (this.EXTRA_CELLS + cellsAcross)) {
                for (var j = 0; j < cellsAcross + 2 * this.EXTRA_CELLS; j++) {
                    var tableObject = null;
                    if (j >= this.EXTRA_CELLS && j < (this.EXTRA_CELLS + cellsAcross)) {
                        var tableObject = new JerboaType(j-this.EXTRA_CELLS,i-this.EXTRA_CELLS);
                        tableObject.setRandomDirection();
                        tableObject.createElement();
                        tableObject.htmlElement.style.top = (tableObject.y * cellWidth ) + "%";
                        tableObject.htmlElement.style.left = (tableObject.x * cellWidth ) + "%";
                        board.appendChild(tableObject.htmlElement);
                        tableObject.htmlElement.addEventListener("click",this.jerboaClicked,false);
                        this.jerboasByName[tableObject.namePos] = tableObject;
                    }
                    this.tableCells[i].push(tableObject);

                }
            }
        }
    },

    jerboaClicked: function (e) {
        window.console.log(e.target.parentElement.attributes.name.value);
        // e.target.style.display = "none";
        window.console.log(jerboaGame.jerboasByName[e.target.parentElement.attributes.name.value].direction);
        if (!gameState.chainInProgress) {
            jerboaGame.createJerboaMoveChain(jerboaGame.jerboasByName[e.target.parentElement.attributes.name.value]);
            jerboaGame.evaluateJerboaMoveChain();
            window.console.log(jerboaGame.currentJerboaMoveChain);
        }
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
    },

    createJerboaMoveChain: function (jerboa) {
        this.currentJerboaMoveChain = new jerboaChain(jerboa);
        this.currentJerboaMoveChain.findLinks(this.tableCells,this.EXTRA_CELLS);
    },

    evaluateJerboaMoveChain: function () {
        gameState.chainInProgress = true;
        this.currentJerboaMoveChainNode = this.currentJerboaMoveChain.first;
        this.progressJerboaMoveChain();
    },

    progressJerboaMoveChain: function () {
        if (this.currentJerboaMoveChainNode) {
            window.console.log("chain is continuing");
            if (this.currentJerboaMoveChainNode != this.currentJerboaMoveChain.first) {
                this.letJerboaEscape(this.currentJerboaMoveChainNode.previous.jerboa);
            }
            if (this.currentJerboaMoveChainNode.isChainEnd) {
                window.console.log("chain is ending");
                this.currentJerboaMoveChain = null;
                this.currentJerboaMoveChainNode = null;
                gameState.chainInProgress = false;
            }
            else {
                gameState.jerboaMinigame.score += this.currentJerboaMoveChainNode.addedScore;
                window.console.log(this.currentJerboaMoveChainNode.addedScore);
                document.getElementById("jerboa_score_score").innerHTML = gameState.jerboaMinigame.score;
                if (!this.currentJerboaMoveChainNode.next.isChainEnd) {
                    var moveToX = this.currentJerboaMoveChainNode.next.jerboa.x; 
                    var moveToY = this.currentJerboaMoveChainNode.next.jerboa.y; 
                    this.repositionJerboa(this.currentJerboaMoveChainNode.jerboa,moveToX,moveToY);
                }
                else {
                    var moveToX = this.currentJerboaMoveChainNode.jerboa.x + this.currentJerboaMoveChainNode.directionVector[0] * 5;
                    var moveToY = this.currentJerboaMoveChainNode.jerboa.y + this.currentJerboaMoveChainNode.directionVector[1] * 5;
                    this.repositionJerboa(this.currentJerboaMoveChainNode.jerboa,moveToX,moveToY);
                }
                this.currentJerboaMoveChainNode = this.currentJerboaMoveChainNode.next;
            }
        }
    },

    repositionJerboa: function (jerboa, newX, newY) {
        var tableOldX = jerboa.x + this.EXTRA_CELLS;
        var tableOldY = jerboa.y + this.EXTRA_CELLS;
        var tableNewX = newX + this.EXTRA_CELLS;
        var tableNewY = newY + this.EXTRA_CELLS;

        var cellsAcross = this.tableCells.length - (this.EXTRA_CELLS * 2);
        jerboa.htmlElement.addEventListener("transitionend",this.nextLink,false);
        jerboa.animateMovement(newX,newY, 100 / cellsAcross);
        jerboa.setPos(newX,newY);
        // this.tableCells[tableNewY][tableNewX] = jerboa;
        this.tableCells[tableOldY][tableOldX] = new nullTableSpace(tableOldY-this.EXTRA_CELLS,tableOldX-this.EXTRA_CELLS);
        this.tableCells[tableOldY][tableOldX].createElement();
        this.tableCells[tableOldY][tableOldX].htmlElement.style.top = ((tableOldY-this.EXTRA_CELLS) * (100/cellsAcross) ) + "%";
        this.tableCells[tableOldY][tableOldX].htmlElement.style.left = ((tableOldX-this.EXTRA_CELLS) * (100/cellsAcross) ) + "%";

        document.getElementById("jerboa_board").appendChild(this.tableCells[tableOldY][tableOldX].htmlElement);
        // this.jerboasByName[jerboa.namePos] = jerboa;
    },

    letJerboaEscape: function (jerboa) {
        jerboa.htmlElement.remove()
        this.jerboasByName[jerboa.namePos] = null;
    },

    nextLink : function (e) {
        e.target.removeEventListener("transitionend",jerboaGame.nextLink,false);
        // jerboaGame.letJerboaEscape(jerboaGame.jerboasByName[e.target.attributes.name.value]);
        jerboaGame.progressJerboaMoveChain();
    }
}

function JerboaType (x,y) {
    this.setPos = function (x,y) {
        this.x = x;
        this.y = y;
        this.namePos = x + "-" + y;
    };

    this.setPos(x,y);
    this.htmlElement = null;
    this.direction = null;
    this.inActiveMove = false;

    this.setRandomDirection = function () {
        var direction_num = Math.floor(Math.random() * 4);
        switch (direction_num) {
            case 0:
                this.direction = 'up';
                break;
            case 1:
                this.direction = 'down';
                break;
            case 2:
                this.direction = 'left';
                break;
            case 3:
                this.direction = 'right';
                break;
            default:
                this.direction = 'up';
        }
    };

    this.getDirectionVector = function() {
        switch (this.direction) {
            case 'left':
                return [-1,0];
            case 'right':
                return [1,0];
            case 'up':
                return [0,-1];
            case 'down':
                return [0,1];
            default:
                return [0,0];
        }
    };

    this.getDirectionRotationString = function() {
        switch (this.direction) {
            case 'left':
                return '-0.25turn';
                break;
            case 'right':
                return '0.25turn';
                break;
            case 'up':
                return '0';
                break;
            case 'down':
                return '0.5turn';
                break;
            default:
                return '0';
        }
    };

    this.createElement = function () {
        this.htmlElement = document.createElement("div");
        this.htmlElement.setAttribute("class","jerboa");
        var jerboaImage = document.createElement("img");
        this.htmlElement.appendChild(jerboaImage);
        jerboaImage.setAttribute("src","arrow.png");
        this.htmlElement.style.transform = "rotate(" + this.getDirectionRotationString() + ")";
        this.htmlElement.setAttribute("name",this.namePos);
    };

    this.animateMovement = function(newX,newY,cellWidth) {
        this.htmlElement.style.top = (newY * cellWidth ) + "%";
        this.htmlElement.style.left = (newX * cellWidth ) + "%";

    }
}

function jerboaChain(firstJerboa) {
    this.first = new JerboaChainNode(firstJerboa);
    this.chainSize = 0;
    this.last = this.first;

    this.findLinks = function (table,emptyCells) {
        var curX = this.last.jerboa.x + emptyCells;
        var curY = this.last.jerboa.y + emptyCells;
        var previouslyWalkedSpaces = [];
        previouslyWalkedSpaces.push(this.first.jerboa);
        while (this.last.next === null) {
            curX += this.last.directionVector[0];
            curY += this.last.directionVector[1];
            var walkedSpace = table[curY][curX];
            if (!walkedSpace) {
                // the walked space is falsey if and only if it was an edge cell
                this.last.next = {
                    isChainEnd : true,
                    previous : this.last,
                    next : "chainEnd",
                };
                this.last = this.last.next;
            }
            else if ((!previouslyWalkedSpaces.includes(walkedSpace)) && walkedSpace.direction != "notAJerboa" && !walkedSpace.inActiveMove) { // skips over empty cells (that are specifically marked as such)
                this.last.next = new JerboaChainNode(walkedSpace);
                this.chainSize++;
                this.last.next.addedScore += this.chainSize * 3;
                this.last.next.previous = this.last;
                this.last = this.last.next;
                walkedSpace.inActiveMove = true;
            }
            previouslyWalkedSpaces.push(walkedSpace);
        }
    };

    this.dereference = function () { // this is for cleanup purposes so that removed Jerboa objects can be garbage collected
        while (this.first.next != null) {
            this.first = this.first.next;
        }
        this.first = null;
        this.last = null;
        chainSize = 0;
    };
}

function JerboaChainNode(jerboa) {
    this.isChainEnd = false;
    this.jerboa = jerboa;
    this.directionVector = this.jerboa.getDirectionVector();
    this.next = null;
    this.previous = null;
    this.addedScore = 0;
}

function nullTableSpace(x,y) {
    this.x = x;
    this.y = y;
    this.namePos = x + "-" + y;
    this.direction = "notAJerboa";
    this.htmlElement = null;

    this.createElement = function() {
        this.htmlElement = document.createElement("div");
        this.htmlElement.setAttribute("class","jerboa");
        this.htmlElement.setAttribute("name",this.namePos);
    };
}

function changeGameSize() {
    // Check to see what the new window dimensions are.
    // If fullscreen, resize for fullscreen.
    // Otherwise, if smaller than 1280x720, resize for the minimum
    // dimensions of 550x310, or 1280x720 if there is enough space.
    // TODO: Implement above in a platform-agnostic way.
}
