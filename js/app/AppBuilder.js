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
         * @returns {Screen}
         */
        this.getScreen = function() {
            return screen;
        };
        /**
         * @returns {app.stream.MediaWikiClient}
         */
        this.getMediaWikiClient = function() {
            return new app.MediaWikiClient(this.getScreen(), this.getAjax());
        };
    };
})();