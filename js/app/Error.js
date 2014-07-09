"use strict";
var app = ns('app');

/**
 * @class app.Error
 */
app.Error = (function(){

    /**
     * @constructor
     */
    return function() {

        /**
         * Show error message
         * @param {String} message
         */
        this.show = function(message) {
            var messageElement = document.getElementById('Message'),
                galleryElement = document.getElementById('Gallery');

            messageElement.innerHTML = message;
            messageElement.style.display = 'block';
            galleryElement.style.display = 'none';
        };
    };
})();