'use strict';
var app = ns('app.stream');

/**
 * @class app.stream.Abstract
 */
app.stream.Abstract = function () {

    /**
     * @param {Callback} callback
     */
    this.init = function (callback) {
        throw new Error('Method init not implemented');
    };

    /**
     * @param {number} limit
     * @param {Callback} callback
     */
    this.getList = function (limit, callback) {
        throw new Error('Method getList not implemented');
    };
};