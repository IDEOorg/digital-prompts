// Client ID and API key from the Developer Console
const CLIENT_ID = 'insert your Google client ID';
const API_KEY = 'insert your Google API key';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const DOCUMENT_ID = 'insert your Google document ID';

// expected format is a google spreadsheet with the following sheets and columns:
// sheet 1: "Prompts" with columns for category keyword, prompt text
// sheet 2: "KeywordToLabel" with colums for category keyword, label, and color

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
var mainArea = document.getElementById('main');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */

/*
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    appendMain(JSON.stringify(error, null, 2));
  });
}
*/

/**
 * Initializer like above, but removed authentication for public spreadsheet;
 * authentication functions below aren't currently used
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    getPrompt();
    mainArea.style.display = 'block';
  }, function(error) {
    appendMain(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    getPrompt();
    mainArea.style.display = 'block';
    document.getElementById('learnings').scrollIntoView({behavior: "smooth", inline: "center"});
    document.getElementById('learnings').style.textDecoration = "underline";
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Generate a random integer from 0 to max
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Read the current category from the query string
 */
function getSelectedCategory() {
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('category');  // we assume one key with no value
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} element id, message Text to be placed in element.
 */
function appendMain(new_id = "", message) {
  var element = document.getElementById(new_id);

  // create the element if it doesn't exist assigning an id if passed in
  if (!element) {
    element = document.createElement("div");
    if (new_id) {
      element.setAttribute("id", new_id);
    }    
  }
  element.innerHTML = message;

  var main = document.getElementById('prompt-area');
  main.appendChild(element);
}

/**
 * Append an <e> element to the bottom nav containing a link to 
 * that category of prompts.
 *
 * @param {string} element id, message Text to be placed in element.
 */
function appendNav(keyword, label) {
  var element = document.getElementById(keyword);

  // create the element if it doesn't exist assigning an id if passed in
  if (!element) {
    element = document.createElement("a");
    if (keyword) {
      element.setAttribute("id", keyword);
    }    
  }

  element.innerHTML = label;
  element.setAttribute('href', 'index.html?category=' + keyword)
  element.setAttribute('class', 'nav-item')

  var categories = document.getElementById('categories');
  categories.appendChild(element);

  return true;
}

/**
 * Print a random prompt from the spreadsheet
 * https://docs.google.com/spreadsheets/d/1Do2-r2Uc5n3IksjfrttM6lW7QW0n7IJawqO2_Q_rM-c/edit
 */
function getPrompt() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: DOCUMENT_ID,
    range: 'KeywordToLabel!A2:C',
    }).then(function(response) {
      var range = response.result;
      let categories = {};

      // build an object of categories, labels, and background colors
      if (range.values.length > 0) {
        for (i = 0; i < range.values.length; i++) {
          var row = range.values[i];

          categories[row[0]] = {
            'label': row[1],
            'color': row[2]
          };

          // add each one to the category nav
          appendNav(row[0], row[1]);
        }
        return categories;
      }
    }, function(response) {
      appendMain('Error: ' + response.result.error.message);
  }).then(function(categories) {
    let prompts = {};

    for (const key in categories) {
      prompts[key] = new Array();
    }

    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: DOCUMENT_ID,
      range: 'Prompts!A2:C',
    }).then(function(response) {
      var range = response.result;
      if (range.values.length > 0) {
        for (let i = 0; i < range.values.length; i++) {
          var row = range.values[i];
          prompts[row[0]].push(row[1]);
        }

        // grab the category from the query string or pick a random one if absent
        let queryCategory = getSelectedCategory();
        let selectedCategory = queryCategory ? queryCategory : Object.keys(categories)[Math.floor(Math.random()*Object.keys(categories).length)];

        // style the background using the category color
        document.body.style.background = categories[selectedCategory].color;

        for (let key in categories) {
          document.getElementById(key).style.background = categories[key].color;
          console.log(key + " = ", categories[key].color)
        }

        // choose and display a random prompt within the selected category
        prompt = prompts[selectedCategory][getRandomInt(prompts[selectedCategory].length)];
        appendMain('category', selectedCategory.toUpperCase());
        appendMain('prompt', prompt);

        // scroll the currently selected category into view in the nav and show it as selected
        document.getElementById(selectedCategory).scrollIntoView({behavior: "smooth", inline: "center"});
        document.getElementById(selectedCategory).style.fontWeight = "700";

      } else {
        appendMain('No data found.');
      }
    }, function(response) {
      appendMain('Error: ' + response.result.error.message);
    });
  });
}