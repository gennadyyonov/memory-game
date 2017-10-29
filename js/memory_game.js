const RULES = "<strong>The rules for playing Memory Game</strong>\n" +
    "        <ul>\n" +
    "            <li>Cards are mixed up and laid in rows, face down.</li>\n" +
    "            <li>Turn over any two cards.</li>\n" +
    "            <li>If the two cards match, keep them.</li>\n" +
    "            <li>If they don't match, turn them back over.</li>\n" +
    "            <li>Remember what was on each card and where it was.</li>\n" +
    "            <li>The game is over either when all the cards have been matched or number of attempts exceeded.</li>\n" +
    "        </ul>";

Round = {
    ROUND_1 : { number : 1, pairs : 4, numberOfCardsPerRow : 3, maxNumberOfAttempts : 10, previewTimeInSec : 2 },
    ROUND_2 : { number : 2, pairs : 6, numberOfCardsPerRow : 4, maxNumberOfAttempts : 20, previewTimeInSec : 3 },
    ROUND_3 : { number : 3, pairs : 9, numberOfCardsPerRow : 6, maxNumberOfAttempts : 30, previewTimeInSec : 4 },
    ROUND_4 : { number : 4, pairs : 12, numberOfCardsPerRow : 8, maxNumberOfAttempts : 40, previewTimeInSec : 5 },
    ROUND_5 : { number : 5, pairs : 15, numberOfCardsPerRow : 10, maxNumberOfAttempts : 50, previewTimeInSec : 6 },
    ROUND_6 : { number : 6, pairs : 18, numberOfCardsPerRow : 12, maxNumberOfAttempts : 60, previewTimeInSec : 7 }
};

Level = {
    INFO: {value: "info"},
    SUCCESS: {value: "success"},
    WARNING: {value: "warning"},
    ERROR: {value: "error"}
};

Status = {
    PREVIEW: {level: Level.WARNING, message: "Preview mode. Please, wait and try to remember cards. Game will be started in several seconds..."},
    IN_PROGRESS: {level: Level.WARNING, message: "{0} attempts left."},
    LOSS: {level: Level.ERROR, message: "Number of attempts exceeded. You Lost."},
    WIN: {level: Level.SUCCESS, message: "All the cards have been matched. Congratulations, You Win!"}
};

GameUtils.nextRound = function (currentRound) {
    var keys = Object.keys(Round);
    for (var i = 0; i < keys.length; i++) {
        var nextRound = Round[keys[i]];
        if (nextRound.number > currentRound.number) {
            return nextRound;
        }
    }
    return currentRound;
};

function ArrayUtils() {
}

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) {
        return args[n] ? args[n] : m;
    });
};

ArrayUtils.shuffle = function (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var index = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[index];
        array[index] = temp;
    }
};

ArrayUtils.matrixify = function (array, numberOfColumns) {
    return array.reduce(function (rows, key, index) {
        return (index % numberOfColumns === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) && rows;
    }, [])
};

function ElementUtils() {
}

ElementUtils.removeAllChildren = function (container) {
    container.empty();
};

ElementUtils.setText = function (element, text) {
    element.text(text);
};

ElementUtils.startRow = function (container) {
    var row = $("<div>").addClass("card-row");
    row.appendTo(container);
    return row;
};

ElementUtils.updateStatus = function (element, status, param) {
    var keys = Object.keys(Level);
    var classesToRemove = [];
    for (var i = 0; i < keys.length; i++) {
        var level = Level[keys[i]];
        if (status.level !== level) {
            classesToRemove.push(level.value);
        }
    }
    for (i = 0; i < classesToRemove.length; i++) {
        element.removeClass(classesToRemove[i]);
    }
    element.addClass(status.level.value);
    ElementUtils.setText(statusBar, status.message.format(param));
};

function Card(value) {

    this.value = value;
    this.opened = false;
    this.locked = false;

    this.close = function () {
        this.setOpen(false);
    };

    this.open = function () {
        this.setOpen(true);
    };

    this.setOpen = function (opened) {
        this.opened = opened;
    };

    this.lock = function () {
        this.locked = true;
    };

    this.check = function (otherCard) {
        if (this.value === otherCard.value) {
            return true;
        } else {
            this.close();
            otherCard.close();
            return false;
        }
    };

    this.isOpened = function () {
        return this.opened;
    };

    this.isLocked = function () {
        return this.locked;
    };

    this.toString = function () {
        return "[" + this.value + " " + this.opened + " " + this.locked + "]";
    }
}

function CardItem(value, widget) {

    this.card = new Card(value);
    this.widget = widget;

    this.open = function () {
        this.doOpen(true);
    };

    this.close = function () {
        this.card.close();
    };

    this.doOpen = function (open) {
        this.card.setOpen(open);
        this.display();
    };

    this.lock = function () {
        this.card.lock();
    };

    this.display = function () {
        this.widget.display(this.card);
    };

    this.compare = function (other) {
        if (this.card.check(other.card)) {
            return true;
        } else {
            var lh = this;
            var rh = other;
            setTimeout(function () {
                lh.display();
                rh.display();
            }, 700);
            return false;
        }
    };

    this.shown = function () {
        return this.card.isOpened() || this.card.isLocked();
    };

    this.toString = function () {
        return this.card.toString();
    };
}

function Board(options) {

    this.statusBar = options.statusBar;
    this.round = options.round;
    this.preview = options.preview;

    this.init = function (container) {
        this.cardItems = [];
        this.selected = null;
        this.attempt = 0;
        ElementUtils.removeAllChildren(container);

        var randomValues = GameUtils.randomValues(this.round.pairs);
        var allValues = ArrayUtils.matrixify(randomValues, this.round.numberOfCardsPerRow);
        for (var row = 0; row < allValues.length; row++) {
            var values = allValues[row];
            this.initRow(container, values);
        }
        var maxNumberOfAttempts = this.round.maxNumberOfAttempts;
        ElementUtils.updateStatus(this.statusBar, Status.IN_PROGRESS, maxNumberOfAttempts);
        if (this.preview) {
            ElementUtils.updateStatus(this.statusBar, Status.PREVIEW);
            this.openAll(true);
            var self = this;
            setTimeout(function () {
                self.openAll(false);
                ElementUtils.updateStatus(this.statusBar, Status.IN_PROGRESS, maxNumberOfAttempts);
            }, self.round.previewTimeInSec * 1000);
        }
    };

    this.initRow = function (container, values) {
        var row = ElementUtils.startRow(container);
        for (var col = 0; col < values.length; col++) {
            var value = values[col];
            this.initCell(row, value);
        }
    };

    this.initCell = function (row, value) {
        var widget = new CardWidget(row);
        widget.init();
        var cardItem = new CardItem(value, widget);
        this.cardItems.push(cardItem);
        widget.handleClick(this.turn(cardItem));
        cardItem.display();
    };

    this.turn = function (cardItem) {
        var self = this;
        return function () {
            if (cardItem.shown()) {
                return;
            }
            cardItem.open();
            if (self.selected === null) {
                self.selected = cardItem;
            } else {
                var matched = self.selected.compare(cardItem);
                self.attempt += (matched ? 0 : 1);
                self.selected = null;
                self.gameOver();
            }
        }
    };

    this.openAll = function (open) {
        for (var i = 0; i < this.cardItems.length; i++) {
            var cardItem = this.cardItems[i];
            cardItem.doOpen(open);
            cardItem.display();
        }
    };

    this.nextRound = function () {
        this.round = GameUtils.nextRound(this.round);
    };

    this.gameOver = function () {
        var i;
        var left = this.round.maxNumberOfAttempts - this.attempt;
        if (left <= 0) {
            for (i = 0; i < this.cardItems.length; i++) {
                this.cardItems[i].lock();
            }
            ElementUtils.updateStatus(this.statusBar, Status.LOSS);
            return;
        }
        for (i = 0; i < this.cardItems.length; i++) {
            var cardItem = this.cardItems[i];
            if (!cardItem.shown()) {
                ElementUtils.updateStatus(this.statusBar, Status.IN_PROGRESS, left);
                return;
            }
        }
        ElementUtils.updateStatus(this.statusBar, Status.WIN);
    };

    this.toString = function () {
        var value = "";
        for (var i = 0; i < this.cardItems.length; i++) {
            value += this.cardItems[i].toString();
            value += " ";
        }
        return value;
    };

}

var board;
var statusBar;
var options;
var container;

function newGame() {
    board = new Board(options);
    initBoard(board);
    return board;
}

function nextRound() {
    board.nextRound();
    initBoard(board);
}

function initBoard(board) {
    board.init(container);
}

$(document).ready(
    function () {
        var rules = $('#rules');
        rules.html(RULES);
        statusBar = $('#statusBar');
        options = {statusBar : statusBar, round : Round.ROUND_1, preview : true};
        var board = new Board(options);
        container = $('#board');
        board = newGame();
    }
);