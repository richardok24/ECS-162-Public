'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Root = function (_React$Component) {
    _inherits(Root, _React$Component);

    function Root(props) {
        _classCallCheck(this, Root);

        var _this = _possibleConstructorReturn(this, (Root.__proto__ || Object.getPrototypeOf(Root)).call(this, props));

        _this.state = { page: '', userName: '' };
        _this.handlePageLoad = _this.handlePageLoad.bind(_this);
        return _this;
    }

    _createClass(Root, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.handlePageLoad();
        }
    }, {
        key: 'handlePageLoad',
        value: function handlePageLoad() {
            // Send request to server to check if flashcard exists in database
            var url = "whichPage";

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            // Load some functions into response handlers.
            var onloadFunc = function onloadFunc() {
                var responseStr = xhr.responseText; // get the JSON string
                var object = JSON.parse(responseStr); // turn it into an object

                // Get user's name
                this.state.userName = object.givenName;

                // Display corresponding page
                if (object.create == 1) {
                    this.setState({ page: 'Main Page' });
                } else if (object.create == 0) {
                    this.setState({ page: 'Answer Page' });
                } else if (object.create == -1) {
                    alert("Error When Creating User Info");
                } else {
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
    }, {
        key: 'render',
        value: function render() {
            if (this.state.page == 'Main Page') {
                return React.createElement(MainPage, { userName: this.state.userName });
            } else if (this.state.page == 'Answer Page') {
                return React.createElement(AnswerPage, { userName: this.state.userName });
            } else {
                return React.createElement('div', { onLoad: this.handlePageLoad });
            }
        }
    }]);

    return Root;
}(React.Component);

var MainPage = function (_React$Component2) {
    _inherits(MainPage, _React$Component2);

    function MainPage(props) {
        _classCallCheck(this, MainPage);

        var _this2 = _possibleConstructorReturn(this, (MainPage.__proto__ || Object.getPrototypeOf(MainPage)).call(this, props));

        _this2.state = { page: 'Main Page' };
        _this2.handleReview = _this2.handleReview.bind(_this2);
        return _this2;
    }

    _createClass(MainPage, [{
        key: 'handleReview',
        value: function handleReview() {
            this.setState({ page: 'Answer Page' });
        }
    }, {
        key: 'handleKeyPress',
        value: function handleKeyPress(event) {
            var inputString = document.getElementById('input').value;

            if (event.key == 'Enter') {
                event.preventDefault();

                if (inputString.trim() != '') {
                    var url = "query?word=" + inputString;

                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);

                    // Load some functions into response handlers.
                    xhr.onload = function () {
                        var responseStr = xhr.responseText; // get the JSON string
                        var object = JSON.parse(responseStr); // turn it into an object

                        // Display translation
                        document.getElementById('translation').value = object.translation;
                    };

                    xhr.onerror = function () {
                        alert('Woops, there was an error making the request.');
                    };

                    // Actually send request to server
                    xhr.send();
                } else {
                    alert('Invalid input!');
                }
            } else {
                document.getElementById('translation').value = '';
            }
        }
    }, {
        key: 'handleSave',
        value: function handleSave() {
            var inputString = document.getElementById('input').value;
            var translation = document.getElementById('translation').value;
            if (inputString != '' && translation != '') {
                var url = "store?english=" + inputString.toLowerCase() + "&chinese=" + translation;
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);

                xhr.onload = function () {
                    var responseStr = xhr.responseText;
                    var object = JSON.parse(responseStr);
                };

                xhr.onerror = function () {
                    alert('save error');
                };

                xhr.send();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.state.page == 'Answer Page') {
                return React.createElement(AnswerPage, { userName: this.props.userName });
            } else {
                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'div',
                        { className: 'header' },
                        React.createElement(StartReviewButtion, { reviewClick: this.handleReview }),
                        React.createElement(Title, null)
                    ),
                    React.createElement(
                        'div',
                        { id: 'main' },
                        React.createElement(Input, { onKeyDown: this.handleKeyPress }),
                        React.createElement(Translation, null)
                    ),
                    React.createElement(
                        'div',
                        { id: 'saveBox' },
                        React.createElement(SaveButtion, { saveClick: this.handleSave })
                    ),
                    React.createElement(
                        'div',
                        { className: 'footer' },
                        React.createElement(UserName, { userName: this.props.userName })
                    )
                );
            }
        }
    }]);

    return MainPage;
}(React.Component);

var AnswerPage = function (_React$Component3) {
    _inherits(AnswerPage, _React$Component3);

    function AnswerPage(props) {
        _classCallCheck(this, AnswerPage);

        var _this3 = _possibleConstructorReturn(this, (AnswerPage.__proto__ || Object.getPrototypeOf(AnswerPage)).call(this, props));

        _this3.state = { page: 'Answer Page' };
        _this3.cards = {};
        _this3.cardFront = true;
        _this3.firstFlip = false;
        _this3.currentCard = null;
        _this3.handleAdd = _this3.handleAdd.bind(_this3);
        _this3.showACard = _this3.showACard.bind(_this3);
        _this3.handleCardLoad = _this3.handleCardLoad.bind(_this3);
        _this3.handleCardFlip = _this3.handleCardFlip.bind(_this3);
        _this3.updateCardInfo = _this3.updateCardInfo.bind(_this3);
        _this3.handleNext = _this3.handleNext.bind(_this3);
        _this3.handleKeyPress = _this3.handleKeyPress.bind(_this3);
        return _this3;
    }

    _createClass(AnswerPage, [{
        key: 'handleAdd',
        value: function handleAdd() {
            this.setState({ page: 'Main Page' });
        }
    }, {
        key: 'showACard',
        value: function showACard() {
            var score = 0;
            var ran = 20;
            var keys = Object.keys(this.cards);
            var index = 0;
            while (ran > score) {
                index = Math.floor(Math.random() * keys.length);

                var correct = this.cards[keys[index]].timesOfCorrect;
                var seen = this.cards[keys[index]].timesOfShown;

                var temp = 1;
                if (seen != 0) {
                    temp = (seen - correct) / seen;
                }
                score = Math.max(1, 5 - correct) + Math.max(1, 5 - seen) + 5 * temp;
                ran = Math.floor(Math.random() * 16);
            }
            this.currentCard = keys[index];
            this.firstFlip = true;
            document.getElementById('textFront').value = this.cards[keys[index]].translation;
        }
    }, {
        key: 'handleCardLoad',
        value: function handleCardLoad() {
            // Load flashcard
            var url = "review";

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            // Load some functions into response handlers.
            var xhrOnLoad = function () {
                var responseStr = xhr.responseText; // get the JSON string
                var object = JSON.parse(responseStr); // turn it into an object

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
    }, {
        key: 'handleCardFlip',
        value: function handleCardFlip() {
            // Toggle flipping
            var card = document.querySelector('.card-body');
            var refresh = document.querySelector('#refreshIcon');
            card.classList.toggle('is-flipped');
            refresh.classList.toggle('refresh');

            this.cardFront == true ? this.cardFront = false : this.cardFront = true;

            if (this.firstFlip) {
                this.firstFlip = false;
                var inputString = document.getElementById('inputAnswer').value.toLowerCase();
                if (inputString == this.cards[this.currentCard].english) {
                    this.cards[this.currentCard].timesOfShown += 1;
                    this.cards[this.currentCard].timesOfCorrect += 1;
                    document.getElementById("correct").style.display = 'inline';
                } else {
                    this.cards[this.currentCard].timesOfShown += 1;
                    document.getElementById('textBack').value = this.cards[this.currentCard].english;
                }
                this.updateCardInfo(this.cards[this.currentCard].english);
                document.getElementById("inputAnswer").disabled = true;
                document.getElementById("inputAnswer").style.color = 'black';
                document.getElementById("inputAnswer").style.backgroundColor = 'white';
            }
        }
    }, {
        key: 'updateCardInfo',
        value: function updateCardInfo(word) {
            console.log(this.cards);
            var url = "update?word=" + word.toLowerCase() + "&timesOfShown=" + this.cards[this.currentCard].timesOfShown + "&timesOfCorrect=" + this.cards[this.currentCard].timesOfCorrect;
            console.log(url);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            // Load some functions into response handlers.
            xhr.onload = function () {
                var responseStr = xhr.responseText; // get the JSON string
                var object = JSON.parse(responseStr); // turn it into an object
            };

            xhr.onerror = function () {
                alert('Woops, there was an error making the request.');
            };

            // Actually send request to server
            xhr.send();
        }
    }, {
        key: 'handleKeyPress',
        value: function handleKeyPress(event) {
            if (event.key == 'Enter') {
                event.preventDefault();
                this.handleCardFlip();
                document.getElementById("inputAnswer").disabled = true;
                document.getElementById("inputAnswer").style.color = 'black';
                document.getElementById("inputAnswer").style.backgroundColor = 'white';
            }
        }
    }, {
        key: 'handleNext',
        value: function handleNext() {
            var card = document.querySelector('.card-body');
            var refresh = document.querySelector('#refreshIcon');
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
    }, {
        key: 'render',
        value: function render() {
            if (this.state.page == 'Main Page') {
                return React.createElement(MainPage, { userName: this.props.userName });
            } else {
                return React.createElement(
                    'div',
                    { onLoad: this.handleCardLoad },
                    React.createElement(
                        'div',
                        { className: 'header' },
                        React.createElement(AddButton, { addClick: this.handleAdd }),
                        React.createElement(Title, null)
                    ),
                    React.createElement(
                        'div',
                        { id: 'answerPageMain' },
                        React.createElement(
                            'div',
                            { className: 'card-container', onClick: this.handleCardFlip },
                            React.createElement(
                                'div',
                                { className: 'card-body' },
                                React.createElement(FlipCardFront, null),
                                React.createElement(FlipCardBack, null)
                            )
                        ),
                        React.createElement(InputAnswer, { onKeyDown: this.handleKeyPress })
                    ),
                    React.createElement(
                        'div',
                        { id: 'nextBox' },
                        React.createElement(NextButton, { nextClick: this.handleNext })
                    ),
                    React.createElement(
                        'div',
                        { className: 'footer' },
                        React.createElement(UserName, { userName: this.props.userName })
                    )
                );
            }
        }
    }]);

    return AnswerPage;
}(React.Component);

// Common

var Title = function (_React$Component4) {
    _inherits(Title, _React$Component4);

    function Title() {
        _classCallCheck(this, Title);

        return _possibleConstructorReturn(this, (Title.__proto__ || Object.getPrototypeOf(Title)).apply(this, arguments));
    }

    _createClass(Title, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'h1',
                { id: 'title' },
                'Lango!'
            );
        }
    }]);

    return Title;
}(React.Component);

var UserName = function (_React$Component5) {
    _inherits(UserName, _React$Component5);

    function UserName() {
        _classCallCheck(this, UserName);

        return _possibleConstructorReturn(this, (UserName.__proto__ || Object.getPrototypeOf(UserName)).apply(this, arguments));
    }

    _createClass(UserName, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'p',
                { id: 'userName' },
                this.props.userName
            );
        }
    }]);

    return UserName;
}(React.Component);

// Main page

var StartReviewButtion = function (_React$Component6) {
    _inherits(StartReviewButtion, _React$Component6);

    function StartReviewButtion() {
        _classCallCheck(this, StartReviewButtion);

        return _possibleConstructorReturn(this, (StartReviewButtion.__proto__ || Object.getPrototypeOf(StartReviewButtion)).apply(this, arguments));
    }

    _createClass(StartReviewButtion, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'button',
                { id: 'reviewButton', type: 'button', onClick: this.props.reviewClick },
                'Start Review'
            );
        }
    }]);

    return StartReviewButtion;
}(React.Component);

var SaveButtion = function (_React$Component7) {
    _inherits(SaveButtion, _React$Component7);

    function SaveButtion() {
        _classCallCheck(this, SaveButtion);

        return _possibleConstructorReturn(this, (SaveButtion.__proto__ || Object.getPrototypeOf(SaveButtion)).apply(this, arguments));
    }

    _createClass(SaveButtion, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'button',
                { id: 'saveButton', type: 'button', onClick: this.props.saveClick },
                'Save'
            );
        }
    }]);

    return SaveButtion;
}(React.Component);

var AddButton = function (_React$Component8) {
    _inherits(AddButton, _React$Component8);

    function AddButton() {
        _classCallCheck(this, AddButton);

        return _possibleConstructorReturn(this, (AddButton.__proto__ || Object.getPrototypeOf(AddButton)).apply(this, arguments));
    }

    _createClass(AddButton, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'button',
                { id: 'addButton', type: 'button', onClick: this.props.addClick },
                'Add'
            );
        }
    }]);

    return AddButton;
}(React.Component);

var Input = function (_React$Component9) {
    _inherits(Input, _React$Component9);

    function Input() {
        _classCallCheck(this, Input);

        return _possibleConstructorReturn(this, (Input.__proto__ || Object.getPrototypeOf(Input)).apply(this, arguments));
    }

    _createClass(Input, [{
        key: 'render',
        value: function render() {
            return React.createElement('textarea', { id: 'input', placeholder: 'English', onKeyDown: this.props.onKeyDown });
        }
    }]);

    return Input;
}(React.Component);

var Translation = function (_React$Component10) {
    _inherits(Translation, _React$Component10);

    function Translation() {
        _classCallCheck(this, Translation);

        return _possibleConstructorReturn(this, (Translation.__proto__ || Object.getPrototypeOf(Translation)).apply(this, arguments));
    }

    _createClass(Translation, [{
        key: 'render',
        value: function render() {
            return React.createElement('textarea', { disabled: true, id: 'translation', placeholder: 'Translation' });
        }
    }]);

    return Translation;
}(React.Component);

// Answer page

var FlipCardFront = function (_React$Component11) {
    _inherits(FlipCardFront, _React$Component11);

    function FlipCardFront() {
        _classCallCheck(this, FlipCardFront);

        return _possibleConstructorReturn(this, (FlipCardFront.__proto__ || Object.getPrototypeOf(FlipCardFront)).apply(this, arguments));
    }

    _createClass(FlipCardFront, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'flipCardFront' },
                React.createElement('img', { id: 'refreshIcon', src: './assets/noun_Refresh_2310283.svg', alt: 'Refresh Icon' }),
                React.createElement('textarea', { disabled: true, id: 'textFront' })
            );
        }
    }]);

    return FlipCardFront;
}(React.Component);

var FlipCardBack = function (_React$Component12) {
    _inherits(FlipCardBack, _React$Component12);

    function FlipCardBack() {
        _classCallCheck(this, FlipCardBack);

        return _possibleConstructorReturn(this, (FlipCardBack.__proto__ || Object.getPrototypeOf(FlipCardBack)).apply(this, arguments));
    }

    _createClass(FlipCardBack, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'flipCardBack' },
                React.createElement(
                    'div',
                    { id: 'correctBox' },
                    React.createElement(
                        'button',
                        { id: 'correct' },
                        'CORRECT!'
                    )
                ),
                React.createElement('textarea', { disabled: true, id: 'textBack' })
            );
        }
    }]);

    return FlipCardBack;
}(React.Component);

var InputAnswer = function (_React$Component13) {
    _inherits(InputAnswer, _React$Component13);

    function InputAnswer() {
        _classCallCheck(this, InputAnswer);

        return _possibleConstructorReturn(this, (InputAnswer.__proto__ || Object.getPrototypeOf(InputAnswer)).apply(this, arguments));
    }

    _createClass(InputAnswer, [{
        key: 'render',
        value: function render() {
            return React.createElement('textarea', { id: 'inputAnswer', onKeyDown: this.props.onKeyDown });
        }
    }]);

    return InputAnswer;
}(React.Component);

var NextButton = function (_React$Component14) {
    _inherits(NextButton, _React$Component14);

    function NextButton() {
        _classCallCheck(this, NextButton);

        return _possibleConstructorReturn(this, (NextButton.__proto__ || Object.getPrototypeOf(NextButton)).apply(this, arguments));
    }

    _createClass(NextButton, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'button',
                { id: 'nextButton', type: 'button', onClick: this.props.nextClick },
                'Next'
            );
        }
    }]);

    return NextButton;
}(React.Component);

ReactDOM.render(React.createElement(Root, null), document.getElementById('root'));

