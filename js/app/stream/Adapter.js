"use strict";
var app = ns('app.stream');

/**
 * @class app.stream.Adapter
 */
app.stream.Adapter = (function(){

    /**
     * @constructor
     * @param {} Stream
     */
    return function(Stream) {

        if (!Stream instanceof app.stream.Abstract) {
            throw new Error('Wrong Stream Object');
        }

        this.init = function(callback) {
            Stream.init(callback);
        };

        this.getList = function(offset, limit, callback) {
            Stream.getList(offset, limit, callback);
        };

    };

})();
