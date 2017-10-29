const CARD_IMAGES = [
    "c01.png", "c02.png", "c03.png", "c04.png", "c05.png", "c06.png", "c07.png", "c08.png", "c09.png", "c10.png", "c11.png", "c12.png", "c13.png",
    "d01.png", "d02.png", "d03.png", "d04.png", "d05.png", "d06.png", "d07.png", "d08.png", "d09.png", "d10.png", "d11.png", "d12.png", "d13.png",
    "h01.png", "h02.png", "h03.png", "h04.png", "h05.png", "h06.png", "h07.png", "h08.png", "h09.png", "h10.png", "h11.png", "h12.png", "h13.png",
    "s01.png", "s02.png", "s03.png", "s04.png", "s05.png", "s06.png", "s07.png", "s08.png", "s09.png", "s10.png", "s11.png", "s12.png", "s13.png"
];
const BACK_IMAGE = "Card-Back-03.png";

function CardWidget(container) {

    this.container = container;
    this.div = null;

    this.init = function () {
        this.div = $("<div>").addClass("card-cell");
        var img = $("<img>");
        img.appendTo(this.div);
        this.div.appendTo(this.container);
    };

    this.handleClick = function (onclick) {
        this.div.on("click", onclick);
    };

    this.display = function (card) {
        var img = this.div.children("img");
        var src = (card.isOpened()) ? "images/cards/" + card.value : "images/backs/" + BACK_IMAGE;
        img.attr('src', src);
    };
}

function GameUtils() {
}

GameUtils.randomValues = function (pairs) {
    var values = [];
    for (var i = 0; i < pairs; i++) {
        var cardImage = this.randomCardImage();
        values.push(cardImage);
        values.push(cardImage);
    }
    ArrayUtils.shuffle(values);
    return values;
};

GameUtils.randomCardImage = function () {
    var index = Math.floor(Math.random() * (CARD_IMAGES.length));
    return CARD_IMAGES[index];
};