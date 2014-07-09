"use strict";
var app = ns('app');

/**
 * Singleton Error class
 * @class app.Error
 */
app.Error = function() {

    if (app.Error.prototype.instance) {
        return app.Error.prototype.instance;
    }

    app.Error.prototype.instance = this;

    /**
     * Show error message
     * @param {String} message
     */
    this.show = function(message) {
        var messageElement = document.getElementById('Message'),
            galleryElement = document.getElementById('Gallery'); // remove

        messageElement.innerHTML = message;
        messageElement.style.display = 'block';
        galleryElement.style.display = 'none'; // remove
    };
};