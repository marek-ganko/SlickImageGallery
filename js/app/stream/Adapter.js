'use strict';
var app = ns('app.stream');

/**
 * @class app.stream.Adapter
 */
app.stream.Adapter = (function () {

    /**
     * @constructor
     * @param {app.stream.Abstract} Stream
     */
    return function (Stream) {

        if (!(Stream instanceof app.stream.Abstract)) {
            throw new Error('Wrong Stream Object');
        }

        /**
         * Initialize stream
         * @param {Callback} callback
         */
        this.init = function (callback) {
            Stream.init(callback);
        };

        /**
         * Get obcjects list
         * @param {Number} limit
         * @param {Callback} callback
         */
        this.getList = function (limit, callback) {
            Stream.getList(limit, callback);
        };

    };

})();
