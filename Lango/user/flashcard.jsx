'use strict';

class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = { page: '', userName: '' };
        this.handlePageLoad = this.handlePageLoad.bind(this);
    }

    componentDidMount() {
        this.handlePageLoad();
    }

    handlePageLoad() {
        // Send request to server to check if flashcard exists in database
        let url = "whichPage";

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        // Load some functions into response handlers.
        let onloadFunc = function () {
            let responseStr = xhr.responseText;  // get the JSON string
            let object = JSON.parse(responseStr);  // turn it into an object

            // Get user's name
            this.state.userName = object.givenName;

            // Display corresponding page
            if (object.create == 1) {
                this.setState({ page: 'Main Page' });
            }

            else if (object.create == 0) {
                this.setState({ page: 'Answer Page' });
            }

            else if (object.create == -1) {
                alert("Error When Creating User Info");
            }
            else {
                alert("Error on Login Render");
            }
        };

        xhr.onload = onloadFunc.bind(this);

        xhr.onerror = function () {
            alert('Woops, there was an error making the request.');
        };

        // Actually send request to server
        xhr.send();
    }

    render() {
        if (this.state.page == 'Main Page') {
            return (
                    <MainPage userName={this.state.userName}/>
                   );
        }

        else if (this.state.page == 'Answer Page') {
            return (
                    <AnswerPage userName={this.state.userName}/>
                   );
        }

        else {
            return (
                    <div onLoad={this.handlePageLoad}></div>
                   );
        }
    }
}

class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { page: 'Main Page' };
        this.handleReview = this.handleReview.bind(this);
    }

    handleReview() {
        this.setState({ page: 'Answer Page' });
    }

    handleKeyPress(event) {
        let inputString = document.getElementById('input').value;

        if (event.key == 'Enter') {
            event.preventDefault();

            if (inputString.trim() != '') {
                let url = "query?word=" + inputString;

                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);

                // Load some functions into response handlers.
                xhr.onload = function () {
                    let responseStr = xhr.responseText;  // get the JSON string
                    let object = JSON.parse(responseStr);  // turn it into an object

                    // Display translation
                    document.getElementById('translation').value = object.translation;
                };

                xhr.onerror = function () {
                    alert('Woops, there was an error making the request.');
                };

                // Actually send request to server
                xhr.send();
            }

            else {
                alert('Invalid input!');
            }
        }

        else {
            document.getElementById('translation').value = '';
        }
    }

    handleSave() {
        let inputString = document.getElementById('input').value;
        let translation = document.getElementById('translation').value;
        if (inputString != '' && translation != '') {
            let url = "store?english=" + inputString.toLowerCase() + "&chinese=" + translation;
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            xhr.onload = function() {
                let responseStr = xhr.responseText;
                let object = JSON.parse(responseStr);

            };

            xhr.onerror = function() {
                alert('save error');
            };

            xhr.send();
        }
    }

    render() {
        if (this.state.page == 'Answer Page') {
            return (
                    <AnswerPage userName={this.props.userName} />
                   );
        }

        else {
            return (
                    <div>
                    <div className='header'>
                    <StartReviewButtion reviewClick={this.handleReview} />
                    <Title />
                    </div>
                    <div id='main'>
                    <Input onKeyDown={this.handleKeyPress} />
                    <Translation />
                    </div>
                    <div id='saveBox'>
                    <SaveButtion saveClick={this.handleSave} />
                    </div>
                    <div className='footer'>
                    <UserName userName={this.props.userName} />
                    </div>
                    </div>
                   );
        }
    }
}

class AnswerPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { page: 'Answer Page' };
        this.cards = {};
        this.cardFront = true;
        this.firstFlip = false;
        this.currentCard = null;
        this.handleAdd = this.handleAdd.bind(this);
        this.showACard = this.showACard.bind(this);
        this.handleCardLoad = this.handleCardLoad.bind(this);
        this.handleCardFlip = this.handleCardFlip.bind(this);
        this.updateCardInfo = this.updateCardInfo.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
    handleAdd() {
        this.setState({ page: 'Main Page' });
    }

    showACard() {
        let score = 0;
        let ran = 20;
        let keys = Object.keys(this.cards);
        let index = 0;
        while(ran > score) {
            index = Math.floor(Math.random() * keys.length);

            let correct = this.cards[keys[index]].timesOfCorrect;
            let seen = this.cards[keys[index]].timesOfShown;

            let temp = 1;
            if (seen != 0) {
                temp = (seen - correct) / seen;
            }
            score = Math.max(1,5-correct)+Math.max(1,5-seen)+5*temp;
            ran = Math.floor(Math.random() * 16);

        }
        this.currentCard = keys[index];
        this.firstFlip = true;
        document.getElementById('textFront').value = this.cards[keys[index]].translation;
    }

    handleCardLoad() {
        // Load flashcard
        let url = "review";

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        // Load some functions into response handlers.
        let xhrOnLoad = function() {
            let responseStr = xhr.responseText;  // get the JSON string
            let object = JSON.parse(responseStr);  // turn it into an object

            this.cards = object;
            this.showACard();
        }.bind(this);

        xhr.onload = xhrOnLoad;
        // xhr.onload = onloadFunc.bind(this);

        xhr.onerror = function () {
            alert('Woops, there was an error making the request.');
        };

        // Actually send request to server
        xhr.send();
    }

    handleCardFlip() {
        // Toggle flipping
        const card = document.querySelector('.card-body');
        const refresh = document.querySelector('#refreshIcon');
        card.classList.toggle('is-flipped');
        refresh.classList.toggle('refresh');

        this.cardFront == true ? this.cardFront = false : this.cardFront = true;

        if(this.firstFlip) {
            this.firstFlip = false;
            let inputString = document.getElementById('inputAnswer').value.toLowerCase();
            if (inputString == this.cards[this.currentCard].english) {
                this.cards[this.currentCard].timesOfShown += 1;
                this.cards[this.currentCard].timesOfCorrect += 1;
                document.getElementById("correct").style.display = 'inline';
            }
            else {
                this.cards[this.currentCard].timesOfShown += 1;
                document.getElementById('textBack').value = this.cards[this.currentCard].english
            }
            this.updateCardInfo(this.cards[this.currentCard].english);
            document.getElementById("inputAnswer").disabled = true;
            document.getElementById("inputAnswer").style.color = 'black';
            document.getElementById("inputAnswer").style.backgroundColor = 'white';
        }
    }

    updateCardInfo(word) {
        console.log(this.cards);
        let url = "update?word=" + word.toLowerCase() +
            "&timesOfShown=" + this.cards[this.currentCard].timesOfShown +
            "&timesOfCorrect=" + this.cards[this.currentCard].timesOfCorrect;
        console.log(url);

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        // Load some functions into response handlers.
        xhr.onload = function () {
            let responseStr = xhr.responseText;  // get the JSON string
            let object = JSON.parse(responseStr);  // turn it into an object
        };

        xhr.onerror = function () {
            alert('Woops, there was an error making the request.');
        };

        // Actually send request to server
        xhr.send();
    }

    handleKeyPress(event) {
        if (event.key == 'Enter') {
            event.preventDefault();
            this.handleCardFlip();
            document.getElementById("inputAnswer").disabled = true;
            document.getElementById("inputAnswer").style.color = 'black';
            document.getElementById("inputAnswer").style.backgroundColor = 'white';
        }
    }


    handleNext() {
        const card = document.querySelector('.card-body');
        const refresh = document.querySelector('#refreshIcon');
        if (this.cardFront == false) {
          this.cardFront = true;
          card.classList.toggle('is-flipped');
          refresh.classList.toggle('refresh');
        }

        this.showACard();
        document.getElementById("correct").style.display = 'none';
        document.getElementById("textBack").value = '';
        document.getElementById("inputAnswer").value = '';
        document.getElementById("inputAnswer").disabled = false;
    }

    render() {
        if (this.state.page == 'Main Page') {
            return (
                    <MainPage userName={this.props.userName} />
                   );
        }

        else {
            return (
                    <div onLoad={this.handleCardLoad}>
                    <div className='header'>
                    <AddButton addClick={this.handleAdd}/>
                    <Title />
                    </div>
                    <div id='answerPageMain'>
                    <div className='card-container' onClick={this.handleCardFlip}>
                    <div className='card-body'>
                    <FlipCardFront />
                    <FlipCardBack />
                    </div>
                    </div>
                    <InputAnswer onKeyDown={this.handleKeyPress} />
                    </div>
                    <div id='nextBox'>
                    <NextButton nextClick={this.handleNext} />
                    </div>
                    <div className='footer'>
                    <UserName userName={this.props.userName} />
                    </div>
                    </div>
                    );
        }
    }
}

// Common

class Title extends React.Component {
    render() {
        return (
                <h1 id='title'>Lango!</h1>
               );
    }
}

class UserName extends React.Component {
    render() {
        return (
                <p id='userName'>{this.props.userName}</p>
               );
    }
}

// Main page

class StartReviewButtion extends React.Component {
    render() {
        return (
                <button id='reviewButton' type='button' onClick={this.props.reviewClick}>Start Review</button>
               );
    }
}

class SaveButtion extends React.Component {
    render() {
        return (
                <button id='saveButton' type='button' onClick={this.props.saveClick}>Save</button>
               );
    }
}

class AddButton extends React.Component {
    render() {
        return (
                <button id='addButton' type='button' onClick={this.props.addClick}>Add</button>
               );
    }
}

class Input extends React.Component {
    render() {
        return (
                <textarea id='input' placeholder='English' onKeyDown={this.props.onKeyDown} />
               );
    }
}

class Translation extends React.Component {
    render() {
        return (
                <textarea disabled id='translation' placeholder='Translation'></textarea>
               );
    }
}

// Answer page

class FlipCardFront extends React.Component {
    render() {
        return (
                <div className='flipCardFront'>
                <img id='refreshIcon' src='./assets/noun_Refresh_2310283.svg' alt='Refresh Icon'/>
                <textarea disabled id='textFront'></textarea>
                </div>
               );
    }
}

class FlipCardBack extends React.Component {
    render() {
        return (
                <div className='flipCardBack'>
                <div id='correctBox'>
                <button id='correct'>CORRECT!</button>
                </div>
                <textarea disabled id='textBack'></textarea>
                </div>
               );
    }
}

class InputAnswer extends React.Component {
    render() {
        return (
                <textarea id='inputAnswer' onKeyDown={this.props.onKeyDown}></textarea>
               );
    }
}

class NextButton extends React.Component {
    render() {
        return (
                <button id='nextButton' type='button' onClick={this.props.nextClick}>Next</button>
               );
    }
}

ReactDOM.render(
        <Root />,
        document.getElementById('root')
        );
