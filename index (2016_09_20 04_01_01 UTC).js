/* 
 do not touch expots.handler
 */
/*! jQuery v1.11.3 | (c) 2005, 2015 jQuery Foundation, Inc. | jquery.org/license */
Accept: application/json
Content-Type: application/json
$ = require("jquery");

var https = require('https');
var urlPrefix = 'https://api.bigoven.com/recipes';
function getJsonRecipes( searchRecipe, eventCallback ) {
    var url = urlPrefix + '?title_kw=' + searchRecipe + '&pg=1&rpp=1&api_key=m05F8PjKe42DE6nqaUJpU17dKc91BJ1J';
    var type = "recipes";
    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = parseJson(body, type);
            eventCallback(stringResult) ;
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
    
}
//array sort by recipe rating
function SortByRating(a, b){
    var aRating = a.StarRating;
    var bRating = b.StarRating; 
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}
//parse recipes JSON file
function parseJson( inputText ) {
    //convert JSON into javascript string
    var text = $.parseJSON(inputText);

    //var $JSON = $( text );
    if (type === "recipes") {
        var recipes = [];
        for (var i = 0; i < text.Results.length; i++) {
            if ( text.Results[i].StarRating >= 4.0 && text.Results[i].ReviewCount >= 5) {
                recipes.push( text.Results[i] );
            }
        }

       recipes.sort(SortByRating);

        //do something calling out recipe names
        for (var i = 0; i <recipes.length; i++) {
            console.log(recipes[i].Title);
        }
    }
    /*
    $recipeID = $JSON.find( "RecipeID" );
    $recipeName = $JSON.find( "Title" );
    */
    //console.log( $JSON );


}
/*
function parseJson(inputText) {
    // sizeOf (/nEvents/n) is 10
    var text = $.parseXML(inputText);
	
	var $xml = $( text );
	$title = $xml.find( "RecipeID" );
	console.log( $xml );
	.substring(inputText.indexOf("\\nEvents\\n")+10, inputText.indexOf("\\n\\n\\nBirths")),
        retArr = [],
        retString = "",
        endIndex,
        startIndex = 0;

    if (text.length === 0) {
        return retArr;
    }

    while(true) {
        endIndex = text.indexOf("\\n", startIndex+delimiterSize);
        var eventText = (endIndex == -1 ? text.substring(startIndex) : text.substring(startIndex, endIndex));
        // replace dashes returned in text from Wikipedia's API
        eventText = eventText.replace(/\\u2013\sg, '');
        // add comma after year so Alexa pauses before continuing with the sentence
        eventText = eventText.replace(/(^\d+)/,'$1,');
        eventText = 'In ' + eventText;
        startIndex = endIndex+delimiterSize;
        retArr.push(eventText);
        if (endIndex == -1) {
            break;
        }
    }
    if (retString !== "") {
        retArr.push(retString);
    }
    retArr.reverse();
    return retArr;
}
*/

exports.handler = function (event, context) {
	console.log("I did nothing!")
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        }  else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
            ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
            ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
            ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    // FindMeARecipe intent
    // Ingredients intent
    // Instructions intent
    if ("FindMeARecipeIntent" === intentName) {
        setRecipeInSession(intent, session, callback);
    } else if ("IngredientsIntent" === intentName) {
        getColorFromSession(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
            ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to Jason's Kitchen, " +
            "What would you like to cook today?, " + "You can tell me something like, " +
            "Find me a recipe for Teriyaki Chicken";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please ask me a recipe by saying, " +
            "Find me a recipe for chicken tenders ";
    var shouldEndSession = false;

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function setRecipeInSession(intent, session, callback){
    var cardTitle = intent.name;
    var recipeSlot = intent.slots.Recipe;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

        if (recipeSlot) {
            var recipe = recipeSlot.value;
            getJsonRecipes(recipe, function (api_response_data){
            sessionAttributes = createFavoriteColorAttributes(recipe);
            speechOutput = "Okay, I found a recipe for " + recipe + ". You can ask me " +
                    "what are the ingredients, " + "or you can ask me, " + "How do I make this?, ";
            repromptText = "You can ask me something like, "+ "what are the ingredients," + "or what are the steps?, ";
            callback(sessionAttributes,
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            })
        
        } else {
            speechOutput = "I'm not sure what you're trying to make, please try again";
            repromptText = "I'm not sure what you're asking for, you can tell me a " +
                    "recipe by saying, what is the recipe for Popcorn Chicken";
            callback(sessionAttributes,
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }

        
 
}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
function setColorInSession(intent, session, callback) {
    var cardTitle = intent.name;
    var favoriteColorSlot = intent.slots.Color;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (favoriteColorSlot) {
        var favoriteColor = favoriteColorSlot.value;
        sessionAttributes = createFavoriteColorAttributes(favoriteColor);
        speechOutput = "Okay, I found a recipe for " + favoriteColor + ". You can ask me " +
                "what are the ingredients, " + "or you can ask me, " + "How do I make this?, ";
        repromptText = "You can ask me something like, "+ "what are the ingredients," + "or what are the steps?, ";
    } else {
        speechOutput = "I'm not sure what you're trying to make, please try again";
        repromptText = "I'm not sure what you're asking for, you can tell me a " +
                "recipe by saying, what is the recipe for Popcorn Chicken";
    }

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function createFavoriteColorAttributes(favoriteColor) {
    return {
        favoriteColor: favoriteColor
    };
}

/*
 * EDIT later
 */
/*
function getIngredientsFromSession(intent, session, callback){
    var ingredients;
    var remprompText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
}
*/

function getColorFromSession(intent, session, callback) {
    var favoriteColor;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if(session.attributes) {
        favoriteColor = session.attributes.favoriteColor;
    }

    if(favoriteColor) {
        speechOutput = "Your favorite color is " + favoriteColor + ", goodbye";
        shouldEndSession = true;
    }
    else {
        speechOutput = "I'm not sure what your recipe is, you can say, get me a recipe for " +
                " Flying Chicken";
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
             buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

c = function (e){ console.log(":( " + e) }
e = {
  "session": {
    "sessionId": "SessionId.5eb92fdb-db95-4c4a-8cb5-13de9df2c869",
    "application": {
      "applicationId": "amzn1.echo-sdk-ams.app.54f427c1-e38c-426a-8917-1e09d41d38b7"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.account.AHMLHMHAU3DMOC3OKDCOJ2SC4MLA"
    },
    "new": false
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.63e2165f-65c6-4109-9e03-b7ce2b993f0e",
    "timestamp": 1447572668747,
    "intent": {
      "name": "FindMeARecipeIntent",
      "slots": {
        "Recipe": {
          "name": "Recipe",
          "value": "chicken"
        }
      }
    }
  }
}
//COMMENT THIS OUT BEFORE SENDING TO AMAZON!!!!!! -- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1 -- !
exports.handler(e, { fail:  c })
exports.handler(e, { fail: c })