MONITOR PAGES
=============

Automatically reload a page in every connected device when it changes.


How to install
--------------

* Get node.

* Get this code.

* Run `npm install`.

* Then `./monitorpages.js`


How it works
------------

* When the browser connects to the server it gets a list of all the HTML pages.

* These pages link to a page that will load that page in a full-screen iframe.

* The page that contains the iframe also subscribes to changes to that page
  via socket.io, so it gets notified whenever the html file changes.

* If it gets a notification that the page changed, it reloads the iframe.

* It tries to copy the page title from the iframe too.


Current limitations
-------------------

* It only monitors html files, not related .js, .css, etc.

* It should really be a system-wide binary, but I'm not sure about how to
  package the templates for that to work. The templates could probably just be
  part of the binary, though. Then you'll be able to run it from any directory
  and it would recursively find and serve up the html files inside that
  directory.

* It doesn't notice new files until you restart the server yet.

* You should be able to pass in the port to listen on as a command-line
  parameter.


Future plans
------------

* Try and keep the iframe's scroll position in tact after reload.

* Some trickery to hide the address bar could be handy for mocking up mobile /
  tablet interfaces.

