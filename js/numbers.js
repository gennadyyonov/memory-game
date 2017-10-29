function CardWidget(container) {

    this.container = container;
    this.div = null;

    this.init = function () {
        this.div = $("<div>").addClass("card-cell");
        this.div.appendTo(this.container);
    };

    this.handleClick = function (onclick) {
        this.div.on("click", onclick);
    };

    this.display = function (card) {
        var classToRemove = (card.isOpened()) ? "close" : "open";
        var classToAdd = (card.isOpened()) ? "open" : "close";
        var text = (card.isOpened()) ? card.value : "";
        this.div.removeClass(classToRemove);
        this.div.addClass(classToAdd);
        ElementUtils.setText(this.div, text);
    };
}

function GameUtils() {
}

GameUtils.randomValues = function (pairs) {
    var values = [];
    for (var i = 0; i < pairs; i++) {
        values.push(i);
        values.push(i);
    }
    ArrayUtils.shuffle(values);
    return values;
};