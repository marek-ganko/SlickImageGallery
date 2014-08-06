'use strict';

/**
 * @param {String} namespacePath
 * @returns {{}}
 */
function ns(namespacePath) {
    var parts = namespacePath.split('.'),
        namespace = window[parts.shift()] || {};

    for (var i  in parts) {
        namespace[parts[i]] = namespace[parts[i]] || {};
    }
    return namespace;
}


/**
 * Main application namespace
 * @type {Object}
 */
var app = {

    /**
     * @param {Object} sourceObject
     * @param {Object} extendingObject
     * @returns {Object}
     */
    extend: function (sourceObject, extendingObject) {
        for (var attrName in extendingObject) {
            sourceObject[attrName] = extendingObject[attrName];
        }
        return sourceObject;
    },

    /**
     * @param bytes
     * @returns {string}
     */
    bytesToSize: function (bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
            i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return bytes ? (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i] : '0 Byte';
    },

    /**
     * @type {Boolean}
     */
    isMobile: 'ontouchstart' in window,

    /**
     * @param {HTMLElement} element
     * @param {String} className
     * @returns {Boolean}
     */
    hasClass: function (element, className) {
        return element && new RegExp('(\\s|^)' + className + '(\\s|$)').test(element.getAttribute('class'));
    },

    /**
     * @param {HTMLElement} element
     * @param {String} className
     * @returns {HTMLElement}
     */
    removeClass: function (element, className) {
        return app.hasClass(element, className) && element.setAttribute('class', element.getAttribute('class').replace(RegExp('(\\s|^)' + className + '(\\s|$)'), ' ').trim());
    },

    /**
     * @param {HTMLElement} element
     * @param {String} className
     * @returns {HTMLElement}
     */
    addClass: function (element, className) {
        return element && !app.hasClass(element, className) && element.setAttribute('class', ((element.getAttribute('class') || '') + ' ' + className).trim());
    }
};


/**
 * @callback Callback
 * @param {String} error
 * @param {*} data
 */

/**
 * @class AppBuilder
 */
var AppBuilder = (function () {

    /**
     * @constructor
     * @param {jQuery} jQuery
     */
    return function (jQuery) {

        /**
         * @returns {app.lazyLoader.Image}
         */
        this.getImageLoader = function () {
            return new app.lazyLoader.Image();
        };

        /**
         * @returns {app.lazyLoader.Content}
         */
        this.getContentLoader = function () {
            return new app.lazyLoader.Content();
        };

        /**
         * @returns {app.Error}
         */
        this.getError = function () {
            return new app.Error();
        };

        /**
         * @returns {app.Gallery}
         */
        this.getGallery = function () {
            return new app.Gallery(this.getImage(), this.getStreamAdapter(), this.getImageLoader(), this.getContentLoader(), this.getError());
        };

        /**
         * @returns {app.preview.Swipe}
         */
        this.getSwipe = function () {
            return new app.preview.Swipe(jQuery);
        };

        /**
         * @returns {app.ImagePreview}
         */
        this.getImagePreview = function () {
            if (app.isMobile) {
                return new app.preview.Mobile(jQuery, this.getSwipe());
            } else {
                return new app.preview.Standard();
            }
        };

        /**
         * @returns {app.Image}
         */
        this.getImage = function () {
            return new app.Image(this.getImagePreview());
        };

        /**
         * @returns {app.stream.Adapter}
         */
        this.getStreamAdapter = function () {
            return new app.stream.Adapter(this.getMediaWikiClient());
        };

        /**
         * @returns {app.stream.Ajax}
         */
        this.getAjax = function () {
            return new app.stream.Ajax(jQuery);
        };

        /**
         * @returns {app.stream.MediaWikiClient}
         */
        this.getMediaWikiClient = function () {
            return new app.stream.MediaWikiClient(this.getAjax());
        };
    };
})();