(function(window, document, $) {
    "use strict";

    var Gallery = function() {
        this.imageStream = new MediaWikiClient();
        this.imageHelper = new Images();
        this.lazyLoader = new LazyLoader();
        this.init();
    };

    Gallery.prototype = {
        container: null,
        imageStream: null,
        imageHelper: null,
        lazyLoader: null,

        init: function() {
            var self = this;
            this.createContainer();
            $("html, body").scrollTop(0);

            this.getImages(function(err) {
                if (err) {
                    return $('#message').html(err).show();
                }
                self.imageHelper.container;
                self.container.appendChild(self.imageHelper.container);
                self.lazyLoader.loadImage();
                self.lazyLoader.listen();
            });
        },

        createContainer: function() {
            this.container = document.createElement('div');
            this.container.id = 'Gallery';
            document.body.appendChild(this.container);
        },

        getImages: function(done) {
            var self = this;

            this.imageStream.getList(function(err, data) {
                if (err) {
                    return done(err);
                }

                self.imageHelper.createList(data, function() {
                    done();
                });
            });
        }
    };

    var Images = function() {
        this.init();
    };

    Images.prototype = {
        container: null,
        blankImgUrl: 'img/_.gif',

        init: function() {
            this.createContainer();
        },

        createContainer: function() {
            this.container = document.createElement('div');
            this.container.id = 'Images';
        },

        createList: function(images, done) {
            for (var i in images) {
                this.container.appendChild(this.create(images[i], i));
            }
            done();
        },

        create: function(image, i) {
            var imageContainer = document.createElement('div');
            imageContainer.setAttribute('class', 'imgContainer blank');


            var link = document.createElement('a');
            link.onclick = function() {
                // @TODO bind preview on click

            };

            var imageElement = document.createElement('img');
            imageElement.setAttribute('src', this.blankImgUrl);
            imageElement.setAttribute('data-src', image.url);
            imageElement.setAttribute('data-descriptionurl', image.descriptionurl);
            imageElement.setAttribute('title', image.name);

            link.appendChild(imageElement);
            imageContainer.appendChild(link);
            return imageContainer;
        }
    };

    var MediaWikiClient = function() {
    };

    MediaWikiClient.prototype = {
        url: 'http://en.wikipedia.org/w/api.php?action=query&format=json&callback=?',
        queryParams: {
            list: 'allimages',
            aisort: 'name',
            aiprop: 'url|mediatype',
            ailimit: 500
        },

        getList: function(done) {
            var self = this;
            // @TODO add pagination with lazy loading
            $.getJSON(this.buildQuery(this.url, this.queryParams), function(data) {
                self.parseResults(data, done);
            });
        },

        buildQuery: function(url, params) {
            for (var name in params) {
                url += '&' + name + '=' + encodeURIComponent(params[name]);
            }
            return url;
        },

        parseResults: function(data, done) {
            if (data.error && data.error.info) {
                return done('Error from MediaWiki: <br>' + data.error.info);
            }

            this.queryParams.aicontinue = data['query-continue'] && data['query-continue'].allimages.aicontinue || null;
            var result = this.filterImages(data.query && data.query.allimages || []);

            if (result.length < 1) {
                done('No data recieved From MediaWiki');
            }

            done(null, result);
        },

        /**
         * Filter images by its mediatype (MediaWiki give also audio files - miser mode is off)
         * @param {Array} data
         * @returns {Array}
         */
        filterImages: function(data) {
            for (var i in data) {
                if (data[i].mediatype != 'BITMAP') {
                    data.splice(i, 1);
                }
            }
            return data;
        }
    };

    var LazyLoader = function() {
    };

    LazyLoader.prototype = {
        threshold: 1000,

        listen: function() {
            window.addEventListener('resize', this.debounce(this.loadImage.bind(this), 10), false);
            document.addEventListener('scroll', this.debounce(this.loadImage.bind(this), 10), false);
            document.addEventListener('touchstart', this.debounce(this.loadImage.bind(this), 10), false);
        },

        debounce: function(fn, delay) {
            var timer = null;
            return function() {
                var self = this,
                    args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    fn.apply(self, args);
                }, delay);
            };
        },

        loadImage: function() {
            // @TODO add error handling
            var unwatched = document.querySelectorAll('img[data-src]');
            for (var i = 0; i < unwatched.length; i++) {
                this.checkViewoport(unwatched[i].parentNode.parentNode, this.threshold, function() {
                    unwatched[i].src = unwatched[i].getAttribute('data-src');
                    unwatched[i].removeAttribute('data-src');
                    console.log('Loading image... ' + unwatched[i].src);
                }, i);
            }
        },

        checkViewoport: function(element, threshold, done) {
            var viewport = document.documentElement.getBoundingClientRect(),
                elementOffset = element.getBoundingClientRect(),
                screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                vieportTop = (viewport.top * (-1));

            return elementOffset.top + vieportTop > screenHeight + vieportTop + threshold || done();
        }
    };

    var gallery = new Gallery();

})(window, document, jQuery);
