
/*
* This function grabs the URL and params.
* It passes the params to outputData object ready for posting, and saves the data in sessionStorage to be posted
* later in session if required.
*/
findParams();

function findParams(settings) {
  let reset = settings && settings.reset ? settings.reset : false;

  window.addEventListener('message', (event) => {
      if (event.origin != 'http://latnewyork.com') {
          return
      }
      console.log('Message Received: ' + event.data);
  });

  let self = window.location.href.toString(); // Get the URL
  let querystring = self.split("?"); // Look for the '?' and splits the string above.
  sessionStorage.setItem('url', decodeURIComponent(querystring[0])); // Add url to session storage
  if (querystring.length > 1) {
    let pairs = querystring[1].split("&"); // Split at existing string at next param.
    for (let i in pairs) { // Repeat for the new truncated string, and loop
      let keyVal = pairs[i].split("="); // foreach, split the key from the value
      if (reset || sessionStorage.getItem(keyVal[0]) === null) { // if storage settings reset OR we don't yet have a key value pair saved...
        sessionStorage.setItem(keyVal[0], decodeURIComponent(keyVal[1]));
      }
    }
  }
}
