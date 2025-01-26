import Card from './Card.mjs';

class Deck {
    constructor(id) {
        this.id = id;
        this.cards = this.createDeck();
    }

    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        return suits.flatMap(suit => values.map(value => new Card(suit, value)));
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    drawCard() {
        if (this.cards.length === 0) return null;
        return this.cards.pop();
    }
}

export default Deck;