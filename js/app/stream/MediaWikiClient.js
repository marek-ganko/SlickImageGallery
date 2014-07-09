"use strict";
var app = ns('app.stream');

/**
 * @class app.stream.MediaWikiClient
 */
app.stream.MediaWikiClient = (function(){

    var self = this,
        maxLimit = 500,
        url = 'http://en.wikipedia.org/w/api.php?action=query&format=json&callback=?',
        listQueryParams = {
            list: 'allimages',
                aisort: 'timestamp',
                aidir: 'descending',
                aiprop: 'url|mediatype|mime|size',
                ailimit: 100
        },
        infoQueryParams = {
            meta: 'filerepoinfo',
            friprop: 'thumbUrl|rootUrl'
        },
        maxThumbWidth = 300,
        maxPreviewWidth = 0, // Screen into constructor (emulation of screen)
        thumbUrl = '',
        rootUrl = '';

    function buildQuery(url, params) {
        for (var name in params) {
            url += '&' + name + '=' + encodeURIComponent(params[name]);
        }
        return url;
    }

    /**
     * @constructor
     * @param {Object} Screen
     * @param {app.stream.Ajax} Ajax
     */
     function constructor(Screen, Ajax) {
        this.maxPreviewWidth = Screen.width;

        this.init = function(callback) {
            Ajax.get(buildQuery(url, infoQueryParams), function(data) {
                self.thumbUrl = data.query && data.query.repos && data.query.repos[1] && data.query.repos[1].thumbUrl || '';
                self.rootUrl = data.query && data.query.repos && data.query.repos[1] && data.query.repos[1].rootUrl || '';
                callback();
            });
        };
        this.getList = function(offset, limit, callback) {

            limit = limit < maxLimit ? limit : maxLimit;
            Ajax.get({offset: offset, limit: limit}, callback);
        };
    };

    constructor.prototype = new app.stream.Abstract();
    return constructor;
})();
