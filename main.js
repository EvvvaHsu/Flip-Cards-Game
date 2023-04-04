// 定義遊戲狀態: 放在文件最上方
const GAME_STATE = {
    FirstCardAwaits: "FirstCardAwaits",
    SecondCardAwaits: "SecondCardAwaits",
    CardsMatchFailed: "CardsMatchFailed",
    CardsMatched: "CardsMatched",
    GameFinished: "GameFinished",
}


// 牌面基本設定
const Symbols = [
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

//此處 Symbols 常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性
// 0-12：黑桃 1-13
// 13-25：愛心 1-13
// 26-38：方塊 1-13
// 39-51：梅花 1-13

//宣告 View
const view = {

    getCardContent(index) {
        const number = this.transformNumber((index % 13) + 1)
        const symbol = Symbols[Math.floor(index / 13)]
        return `
          <p>${number}</p>
          <img src="${symbol}" />
          <p>${number}</p>
        `
    },


    getCardElement(index) {
        return `<div data-index="${index}" class="card back"></div>`
    },

    transformNumber(number) {
        switch (number) {
            case 1:
                return 'A'
            case 11:
                return 'J'
            case 12:
                return 'Q'
            case 13:
                return 'K'
            default:
                return number
        }
    },


    displayCards(indexes) {
        const rootElement = document.querySelector("#cards")

        rootElement.innerHTML = indexes
            .map(index => this.getCardElement(index))
            .join("")
        //rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join("")
    },

    // 原本的寫法
    // const view = {
    //     displayCards: function displayCards() { ...  }
    //   }

    flipCards(...cards) {
        //console.log(card.dataset.index)
        //把參數變成sperate operater...之後, 可以一次輸入很多值, 然後將回傳的值變成陣列
        //filpcards(1,2,3,4,5) -> cards = [1,2,3,4,5] 

        cards.map(card => {

            if (card.classList.contains('back')) {
                // 回傳正面
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(Number(card.dataset.index))
                //card.innerHTML = this.getCardContent(10) // 暫時給定 10
                return
            }

            // 回傳背面
            card.classList.add('back')
            card.innerHTML = null

        })

        //如果是正面,回傳背面; 如果是背面,回傳正面
    },

    pairCards(...cards) {
        cards.map(card => {
            card.classList.add('paired')
        })
    },

    //textContent = innerText
    // != innerHTML
    renderScore(score) {
        document.querySelector(".score").textContent = `Score: ${score}`;
    },

    renderTriedTimes(times) {
        document.querySelector(".tried").textContent = `You've tried: ${times} times`;
    },


    appendWrongAnimation(...cards) {
        cards.map(card => {
            card.classList.add('wrong')
            card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
        })
    },

    showGameFinished() {
        const div = document.createElement('div')
        div.classList.add('completed')
        div.innerHTML = `
          <p>Complete!</p>
          <p>Score: ${model.score}</p>
          <p>You've tried: ${model.triedTimes} times</p>
        `
        const header = document.querySelector('#header')
        header.before(div)
    }


}


const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys())
        for (let index = number.length - 1; index > 0; index--) {
            let randomIndex = Math.floor(Math.random() * (index + 1))
                ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    }
}

// console.log(utility.getRandomNumberArray(5))




//宣告 Controller
const controller = {
    currentState: GAME_STATE.FirstCardAwaits,

    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },

    //依照不同的遊戲狀態, 做不同的行為
    dispatchCardAction(card) {

        if (!card.classList.contains('back')) {
            return
        }

        switch (this.currentState) {
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.renderTriedTimes(++model.triedTimes)

                view.flipCards(card)
                model.revealedCards.push(card)

                //console.log(model.isRevealedCardsMatched())

                // 判斷配對是否成功
                if (model.isRevealedCardsMatched()) {
                    // 配對成功

                    view.renderScore((model.score += 10))
                    this.currentState = GAME_STATE.CardsMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []

                    // 加在這裡
                    if (model.score === 260) {
                        console.log('showGameFinished')
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished()  
                        return
                    }

                    this.currentState = GAME_STATE.FirstCardAwaits

                } else {
                    // 配對失敗
                    this.currentState = GAME_STATE.CardsMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(this.reserCards, 1000)
                    //resetCards不能加(), 因為setTimeout要回傳的是function本身, 若加(), 會回傳function結果
                }


                break
        }

        console.log('this.currentState', this.currentState)
        console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
    },


    reserCards() {

        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwaits
    }



}


//宣告 Model
const model = {
    revealedCards: [],

    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    },

    score: 0,

    triedTimes: 0

}


controller.generateCards() // 取代 view.displayCards()
//view.displayCards()

// 加上事件監聽器翻牌
// querySelectorAll 是 Node List (array-like), 不是array, 所以沒有.map的功能, 所以改用forEach
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
    })
})



