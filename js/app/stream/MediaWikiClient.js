"use strict";
var app = ns('app.stream');

/**
 * @class app.stream.MediaWikiClient
 */
app.stream.MediaWikiClient = (function() {

    var maxLimit = 500,
        url = 'http://en.wikipedia.org/w/api.php?action=query&format=json',
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
        thumbUrl = '',
        rootUrl = '';

    /**
     * @constructor
     * @param {app.stream.Ajax} Ajax
     */
    return function(Ajax) {
        var constructor = function(Ajax) {

            var _self = this;

            this.options = {
                maxThumbWidth: 300,
                maxImageWidth: screen.width,
                imageWidthThreshold: 400
            };

            /**
             * @param {Callback} callback
             */
            this.init = function(callback) {
                this.setImageUrl(callback);
            };

            /**
             * Sets urls for thumbUrl and rootUrl
             * @param {Callback} callback
             */
            this.setImageUrl = function(callback) {
                Ajax.get({
                    url: url,
                    dataType: 'jsonp',
                    data: infoQueryParams
                }, function(error, data) {
                    thumbUrl = data.query && data.query.repos && data.query.repos[1] && data.query.repos[1].thumbUrl || '';
                    rootUrl = data.query && data.query.repos && data.query.repos[1] && data.query.repos[1].rootUrl || '';
                    return error && callback(error) || callback(null);
                });
            };

            /**
             * Gets list of images
             * @param {Number} limit
             * @param {Callback} callback
             */
            this.getList = function(limit, callback) {
                limit = limit > maxLimit ? maxLimit : limit;
                Ajax.get({
                    url: url,
                    dataType: 'jsonp',
                    data: app.extend(listQueryParams, {ailimit: limit})
                }, function(error, data) {
                    return error && callback(error) || _self.validateResults(data, callback);
                });
            };

            /**
             * Validates results
             * @param {Object} data
             * @param {Callback} callback
             * @returns {*}
             */
            this.validateResults = function(data, callback) {
                if (data.error && data.error.info) {
                    return callback('Error from MediaWiki: <br>' + data.error.info);
                }

                listQueryParams.aicontinue = data['query-continue'] && data['query-continue'].allimages.aicontinue || '';
                var result = this.filterImages(data.query && data.query.allimages || []);

                return result.length < 1 && callback('No data recieved From MediaWiki') || callback(null, result);
            };

            /**
             * Filter images by its mediatype (MediaWiki give also audio files - miser mode is off)
             * @param {Array} data
             * @returns {Array}
             */
            this.filterImages = function(data) {
                for (var i in data) {
                    var image = data[i];
                    if (
                    // MediaWiki adds ogg to allimages
                        image.mediatype != 'BITMAP' ||

                        // remove unsupported tif image
                        image.mime == 'image/tiff'
                        ) {
                        delete data[i];
                        continue;
                    }
                    image.url = image.url.replace('?', '%3F');
                    image.thumb = this.shrinkImage(image, this.options.maxThumbWidth);
                    image.src = this.shrinkImage(image, this.options.maxImageWidth);
                }

                return data.filter(function(value) {
                    return value;
                });
            };

            /**
             *
             * @param {Object} image
             * @param maxWidth
             * @returns {*|string|url|.ajaxSettings.url|.ajaxSettings.flatOptions.url|XML}
             */
            this.shrinkImage = function(image, maxWidth) {
                return image.width - this.options.imageWidthThreshold < maxWidth ?
                    image.url :
                    image.url.replace(rootUrl, thumbUrl) + '/' + maxWidth + 'px-' + image.name;
            };
        };

        constructor.prototype = new app.stream.Abstract();
        return new constructor(Ajax);
    };
})();
