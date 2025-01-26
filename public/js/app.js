class DeckManager {
    constructor() {
        this.currentDeckId = '';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('createDeck').addEventListener('click', async () => {
            const response = await fetch('/tmp/deck', { method: 'POST' });
            const data = await response.json();
            this.currentDeckId = data.deck_id;
            document.getElementById('deckId').value = this.currentDeckId;
        });

        document.getElementById('shuffleDeck').addEventListener('click', () => this.shuffleDeck());
        
        document.getElementById('drawCard').addEventListener('click', async () => {
            const deckId = this.getCurrentDeckId();
            if (!deckId) return;
            
            const response = await fetch(`/tmp/deck/${deckId}/card`);
            const data = await response.json();
            if (data.card) {
                this.displayCard(data.card);
            }
        });

        document.getElementById('viewDeck').addEventListener('click', () => this.viewDeck());
        document.getElementById('hideDeck').addEventListener('click', () => this.hideDeck());
    }

    createCardElement(card, animate = false) {
        const div = document.createElement('div');
        div.className = `card ${card.suit} ${animate ? 'drawn' : ''}`;
        div.innerHTML = `
            <div class="card-content">
                <div>${card.value}</div>
                <div>${this.getSuitSymbol(card.suit)}</div>
            </div>
        `;
        return div;
    }

    getSuitSymbol(suit) {
        const symbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        return symbols[suit] || suit;
    }

    async displayCard(card) {
        const display = document.getElementById('cardDisplay');
        display.innerHTML = '';
        display.appendChild(this.createCardElement(card, true));
    }

    async displayDeck(cards) {
        const display = document.getElementById('deckDisplay');
        display.innerHTML = '';
        cards.forEach(card => {
            display.appendChild(this.createCardElement(card));
        });
    }

    async shuffleDeck() {
        const deckId = this.getCurrentDeckId();
        if (!deckId) return;
        
        await fetch(`/tmp/deck/shuffle/${deckId}`, { method: 'PATCH' });
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.add('shuffle'));
        await this.viewDeck();
    }

    getCurrentDeckId() {
        return document.getElementById('deckId').value;
    }

    async viewDeck() {
        const deckId = this.getCurrentDeckId();
        if (!deckId) return;
        
        const response = await fetch(`/tmp/deck/${deckId}`);
        const data = await response.json();
        if (data.cards) {
            this.displayDeck(data.cards);
        }
    }

    hideDeck() {
        const display = document.getElementById('deckDisplay');
        display.innerHTML = '';
    }

}

new DeckManager();