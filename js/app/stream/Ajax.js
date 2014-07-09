"use strict";
var app = ns('app.stream');

/**
 * @class app.stream.Ajax
 */
app.stream.Ajax = (function(){

    function xhrRequest(data, callback, error) {

        var errorMessage = 'Error';
        error(errorMessage);
    }

    /**
     * @constructor
     */
    return function() {
        this.get = function(data, callback) {

            xhrRequest(data, function(){
                return callback();
            },function(errorMessage){
                return callback(errorMessage);
            });

        };
    };
})();