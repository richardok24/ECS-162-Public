const express = require('express');
const port = 57903;
const APIrequest = require('request');
const http = require('http');

const APIkey = "AIzaSyDJBDdDxZo_p706SvZ_nUTE3JXdy0r4k2Q";
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey

const passport = require('passport');
const cookieSession = require('cookie-session');

const GoogleStrategy = require('passport-google-oauth20');
const sqlite3 = require("sqlite3").verbose();
const dbFileName = "Flashcards.db";
const db = new sqlite3.Database(dbFileName);

const googleLoginData = {
	clientID : '830566896524-jteivd7p627tnigacusu92jck1u8jn6q.apps.googleusercontent.com',
	clientSecret: 'V5e_T7l2T5moHPZ8Mloki6p9',
	callbackURL: '/auth/redirect'
};

passport.serializeUser((userData, done) => {
	done(null, userData);
});

passport.deserializeUser((userData, done) => {

	done(null, userData);;
});


// Strategy configuration.
// Tell passport we will be using login with Google, and
// give it our data for registering us with Google.
// The gotProfile callback is for the server's HTTPS request
// to Google for the user's profile information.
// It will get used much later in the pipeline.
passport.use( new GoogleStrategy(googleLoginData, gotProfile) );

// Let's build a server pipeline!

// app is the object that implements the express server
const app = express();

// pipeline stage that just echos url, for debugging
app.use('/', printURL);

// Check validity of cookies at the beginning of pipeline
// Will get cookies out of request, decrypt and check if
// session is still going on.
app.use(cookieSession({
    maxAge: 6 * 60 * 60 * 1000, // Six hours in milliseconds
    // meaningless random string used by encryption
    keys: ['hanger waldo mercy dance']
}));

// Initializes request object for further handling by passport
app.use(passport.initialize());

// If there is a valid cookie, will call deserializeUser()
app.use(passport.session());
app.get('/*',express.static('public'));
// next, handler for url that starts login with Google.
// The app (in public/login.html) redirects to here (not an AJAX request!)
// Kicks off login process by telling Browser to redirect to
// Google. The object { scope: ['profile'] } says to ask Google
// for their user profile information.
app.get('/auth/google',
	passport.authenticate('google',{ scope: ['profile'] }) );
// passport.authenticate sends off the 302 response
// with fancy redirect URL containing request for profile, and
// client ID string to identify this app.

// Google redirects here after user successfully logs in
// This route has three handler functions, one run after the other.
app.get('/auth/redirect', function (req, res, next) { next(); },
	// This will issue Server's own HTTPS request to Google
	// to access the user's profile information with the
	// temporary key we got in the request.
	passport.authenticate('google'),
	// then it will run the "gotProfile" callback function,
	// set up the cookie, call serialize, whose "done"
	// will come back here to send back the response
	// ...with a cookie in it for the Browser!
	function (req, res) {

	    res.redirect('/user/flashcard.html');
	});

// static files in /user are only available after login
app.get('/user/*',
	isAuthenticated, // only pass on to following function if
	// user is logged in
	// serving files that start with /user from here gets them from ./
	express.static('.')
);



function gotProfile(accessToken, refreshToken, profile, done){
	let userData = {
		"id" : profile.id,
		"givenName" : profile.name.givenName,
		"familyName" : profile.name.familyName,
	};

	function checkUserID(id, givenName,familyName){
	const callcmd = 'SELECT rowID FROM user WHERE userID = $id';
	db.get(callcmd, {
		$id: id
	},(error,row)=>{
		if(error){
			console.log(error);
            userData.create = -1;
            done(null, userData);
		}
		else{
			if(row != undefined){
				db.get('SELECT rowID FROM Flashcard WHERE userID = $id',{
					$id: id
				},(error,row)=>{
					if(error){
						console.log(error);
						userData.create = -1;
						done(null, userData);
					}
					else{
						if(row!=undefined){
							userData.create = 0;
						}
						else{
							userData.create = 1;
						}
						done(null, userData);
					}
				})

			}
			else{
				db.run('INSERT INTO user (userID, givenName, familyName) VALUES ($ID, $GN, $LN)',{
					$ID: id,
					$GN: givenName,
					$LN: familyName
				},(error)=>{
					if(error){
						console.log(error);
                        userData.create = -1;
					}
					else{
						//new user information is in the database
                        userData.create = 1;
					}
                    done(null, userData);
				})
			}
		}
	});
}

    checkUserID(userData.id, userData.givenName, userData.familyName);
}

function printURL (req, res, next) {
    next();
}

// function to check whether user is logged when trying to access
// personal data
function isAuthenticated(req, res, next) {
    if (req.user) {
	next();
    } else {
	res.redirect('/public/login.html');  // send response telling
	// Browser to go to login page
    }
}


// An object containing the data expressing the query to the
// translate API.
// Below, gets stringified and put into the body of an HTTP PUT request.
let requestObject =
{
	"source": "en",
	"target": "zh-CN",
	"q": [
		"example phrase"
	]
}

response = 0;


function queryHandler(req, res, next) {
	let qObj = req.query;
	requestObject.q = qObj.word;


	APIrequest({ url: url, method: "POST", headers: {"content-type": "application/json"}, json: requestObject}, APIcallback );

	function APIcallback(err, APIresHead, APIresBody) {
		if ((err) || (APIresHead.statusCode != 200)) {
			// API is not working
			console.log("Got API error");
		} else {
			if (APIresHead.error) {
				// API worked but is not giving you data
				console.log(APIresHead.error);
			} else {
				response = APIresBody.data.translations[0].translatedText;
			}
		}

		if (qObj.word != undefined) {
			res.json({ "translation" : response });
		}
		else {
            next();
		}
	}

}

function fileNotFound(req, res) {
	let url = req.url;
	res.type('text/plain');
	res.status(404);
	res.send('Cannot find '+url);
}

function storeHandler(req, res, next) {
	function insertCMD(userID, english_text, translate_text){
		const insertcmdStr = 'INSERT or IGNORE INTO flashcard (userId, english ,translation ,timesOfShown,timesOfCorrect) VALUES($id,$English_text,$translate_text,$shown,$correct)';
		db.run(insertcmdStr,{
				$id: req.user.id,
				$English_text: english_text,
				$translate_text: translate_text,
				$shown: 0,
				$correct:0
				},callbackinsert)
		function callbackinsert(error){
			if(error){
                console.log("error!: ", error);
				res.json({"success" : 0});
			}
			else{
				res.json({"success" : 1});
			}
		}
	}

	let sObj = req.query;
	let english = sObj.english;
	let translation = sObj.chinese;
	let user = req.user;
	let id = user.id;
	if (english == undefined || translation  == undefined || id == undefined) {
		next();
	}
	else {
		insertCMD(id, english, translation);
	}
}

function whichPageHandler(req, res, next) {
    let query = req.query;
    if (query != undefined) {
        res.json(req.user);
    }
    else {
        next();
    }
}

function reviewHandler(req,res,next){
	function getCMD(userID){
		const getcmdStr = 'SELECT english, translation, timesOfShown, timesOfCorrect FROM Flashcard WHERE userID = $userID';
		db.all(getcmdStr,{
			$userID: userID
		},(error,rows)=>{
			if(error){
				console.log("error!");
			}
			else{
				let back = {};
				let i = 0;
				rows.forEach(row=>{
					back["card"+i] = row;
					i++;
				})
				res.json(back);
			}
		})
	}
	let user = req.user;
	let id = user.id;
	if (id == undefined) {
		next();
	}
	else {
		getCMD(id);
	}

}

function updateHandler(req,res,next){

	function updateCMDshown(userid, english_text, shown, correct){
		const updatecmdStr = 'UPDATE Flashcard SET timesOfShown = $show, timesOfCorrect = $corr WHERE userID = $userid AND english = $english_text';
		db.run(updatecmdStr, {
			$show: shown,
			$corr: correct,
			$userid: userid,
			$english_text: english_text,

		},callbackupdate)
	function callbackupdate(error){
			if(error){
				console.log("error, cannot update");
			}
			else{
				console.log("successful");
			}

		}
	}
    let qObj = req.query;
    if (qObj.word != undefined) {
        let english = qObj.word;
        let seen = qObj.timesOfShown;
        let correct = qObj.timesOfCorrect;
        let userId = req.user.id;

        console.log(english);
        console.log(seen);
        console.log(correct);
        console.log(userId);
				updateCMDshown(userId, english, seen, correct);
			}
    else {
        next();
    }

}

// put together the server pipeline
app.get('/user/query', queryHandler);   // if not, is it a valid query?
app.get('/user/store', storeHandler);
app.get('/user/review', reviewHandler)
app.get('/user/whichPage', whichPageHandler);
app.get('/user/update', updateHandler);
app.use( fileNotFound );            // otherwise not found
app.listen(port, function () {console.log('Listening...');} )
