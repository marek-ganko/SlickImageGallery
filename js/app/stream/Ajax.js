'use strict';
var app = ns('app.stream');

/**
 * @class app.stream.Ajax
 */
app.stream.Ajax = (function(){

    /**
     * @constructor
     */
    return function() {

        /**
         * Ajax call
         * @param {Object} data
         * @param {Callback} callback
         */
        this.get = function(data, callback) {

            jQuery.ajax(data).done(function(data){

                return callback(null, data);

            }).fail(function(jqXHR, textStatus, errorThrown){

                return callback('Error requesting ajax response: ' + errorThrown);

            });
        };
    };
})();