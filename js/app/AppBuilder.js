"use strict";
var app = ns('app');

/**
 * @param {String} namespacePath
 * @returns {{}}
 */
function ns(namespacePath) {
    var parts = namespacePath.split('.'), namespace = {};
    for (var i  in parts) {
        namespace[parts[i]] = namespace[parts[i]] || {};
    }
    return namespace;
}

/**
 * @function app.extend
 * @param {Object} sourceObject
 * @param {Object} extendingObject
 * @returns {Object}
 */
app.extend = function(sourceObject, extendingObject) {
    for (var attrName in extendingObject) {
        sourceObject[attrName] = extendingObject[attrName];
    }
    return sourceObject;
};

/**
 * @callback Callback
 * @param {String} error
 * @param {*} data
 */

/**
 * @class AppBuilder
 */
var AppBuilder = (function() {

    /**
     * @constructor
     */
    return function() {

        /**
         * @returns {app.lazy.ImageLoader}
         */
        this.getImageLoader = function() {
            return new app.lazy.ImageLoader();
        };
        /**
         * @returns {app.lazy.ContentLoader}
         */
        this.getContentLoader = function() {
            return new app.lazy.ContentLoader();
        };
        /**
         * @returns {app.Gallery}
         */
        this.getGallery = function() {
            return new app.Gallery(this.getImage(), this.getStreamAdapter(), this.getImageLoader(), this.getContentLoader());
        };
        /**
         * @returns {app.Image}
         */
        this.getImage = function() {
            return new app.Image();
        };
        /**
         * @returns {app.stream.Adapter}
         */
        this.getStreamAdapter = function() {
            return new app.stream.Adapter(this.getMediaWikiClient());
        };
        /**
         * @returns {app.stream.Ajax}
         */
        this.getAjax = function() {
            return new app.Ajax();
        };
        /**
         * @returns {app.stream.MediaWikiClient}
         */
        this.getMediaWikiClient = function() {
            return new app.MediaWikiClient(this.getAjax());
        };
    };
})();