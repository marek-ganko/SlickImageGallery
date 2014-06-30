(function($) {
    var Gallery = function() {
        var imageStream = new MediaWikiClient();

        this.init = function() {
            console.log('Gallery initiated');
            getImages(function(data) {

                console.log('imageList', data);

            });
        };

        var getImages = function(callback) {

            imageStream.getList(callback);

        };
    };

    var MediaWikiClient = function() {
        var options = {
                limit: 50
            },
            url = 'http://en.wikipedia.org/w/api.php?action=query&format=json&callback=?',
            queryParams = {
                list: 'allimages',
                aisort: 'name',
                aiprop: 'url',
                ailimit: options.limit
            };

        this.getList = function(callback) {

            $.getJSON(buildQuery(url, queryParams), function(data) {
                callback(parseResults(data));
            });
        };

        var buildQuery = function(url, params) {

            for (var name in params) {
                url += '&' + name + '=' + encodeURIComponent(params[name]);
            }
            return url;

        };

        var parseResults = function(data) {

            queryParams.aicontinue = data['query-continue'] && data['query-continue'].allimages.aicontinue || null;
            return data.query && data.query.allimages || [];

        };
    };

    var gallery = new Gallery();
    gallery.init();

})(jQuery);
