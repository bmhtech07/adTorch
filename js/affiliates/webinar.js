


/*
* This checks to see if any new elements have been added to the DOM body. If so, it re-runs findLinks.
*
 */
let docBody = document.body || document.documentElement; // document.body might not be ready when on initial load
const observer = new MutationObserver(() => {
  if(! docBody) {
    window.setTimeout(observer, 500);
    return;
  }
  findLinks();
});
// call `observe()` on that MutationObserver instance ,
// passing it the element to observe, and the options object
observer.observe(docBody, {subtree: true, childList: true});




/*
 * This is for SPAs. It re-runs findFields every time a window.location href change is detected.
 */
let oldHref = document.location.href;
window.onload = () => {
  let bodyList = document.querySelector("body");
  let observer = new MutationObserver((mutations) => {
    mutations.forEach( () => {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        findLinks();
      }
    });
  });
  observer.observe(bodyList, {childList: true, subtree: true});
};



/*
* This function finds the fields by looking for any input field with 'email'. The first block adds a listener to disable
* the 'enter' functionality because (We don't want form submitting without validating it's an actual email address, or
* we'll receive too many requests.)
* The second block adds 'onblur' where we capture the email address.
* Finally, we store the data in sessionStorage to be submitted now or later in session (if required)
* In BOTH blocks we add a customer attribute to the field, in order to recognise if we've already added the respective
* listerner. This IS necessary - otherwise we add repeated listeners to the field each time we run findFieldsand end up
* with multiple events for the same field onBlur.
*/
function findLinks(settings) {
  let reset = settings && settings.reset ? settings.reset : false;
  var affiliateLinks = document.querySelectorAll("a[href*='/lggjh/0']");
  affiliateLinks.forEach(link => {
      link.href = link.href + 'utm_campaign=' + sessionStorage.utm_campaign
  });
}
