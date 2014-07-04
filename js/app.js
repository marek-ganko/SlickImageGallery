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
        bottomTriggerElement: null,
        imageStream: null,
        imageHelper: null,
        lazyLoader: null,

        init: function() {
            var self = this,
                lazyLoaderCalled = false;
            this.createContainer();

            $("html, body").scrollTop(0);

            var called = false;

            this.getImages(function(err) {
                if (err) {
                    return $('#message').html(err).show();
                }
                if (!lazyLoaderCalled){
                    self.lazyLoader.listenForImages();
                    lazyLoaderCalled = true;
                }
            });
        },

        createContainer: function() {
            this.container = document.createElement('div');
            this.container.id = 'Gallery';

            // body #Gallery
            document.body.appendChild(this.container);

            // #Gallery #Images
            this.container.appendChild(this.imageHelper.container);

            this.bottomTriggerElement = document.createElement('div');
            this.bottomTriggerElement.id = 'bottomTrigger';

            // #Gallery #bottomTrigger
            this.container.appendChild(this.bottomTriggerElement);
        },

        getImages: function(done) {
            var self = this;

            this.lazyLoader.listenForContent(
                this.bottomTriggerElement,
                function() {
                    self.imageStream.getList(function(err, data) {
                        if (err) {
                            return done(err);
                        }

                        self.imageHelper.createList(data, function() {
                            done();
                        });
                    })
                }
            );
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
                // #Images .imgContainer
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

            // a img
            link.appendChild(imageElement);
            // .imgContainer a
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
            ailimit: 100
        },

        getList: function(done) {
            var self = this;
            console.log('Loading page... ' + (this.queryParams.aicontinue || 'first'));
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
        imagesThreshold: 2000,
        contentThreshold: 4000,

        listenForImages: function() {
            window.addEventListener('resize', this.debounce(this.loadImage.bind(this), 10), false);
            document.addEventListener('scroll', this.debounce(this.loadImage.bind(this), 10), false);
            document.addEventListener('touchstart', this.debounce(this.loadImage.bind(this), 10), false);

            this.loadImage.call(this);
        },

        listenForContent: function(triggerElement, done) {
            window.addEventListener('resize', this.debounce(this.loadContent.bind(this, triggerElement, done), 100), false);
            document.addEventListener('scroll', this.debounce(this.loadContent.bind(this, triggerElement, done), 100), false);
            document.addEventListener('touchstart', this.debounce(this.loadContent.bind(this, triggerElement, done), 100), false);

            this.loadContent.call(this, triggerElement, done);
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
                this.checkViewoport(unwatched[i].parentNode.parentNode, this.imagesThreshold, function() {
                    unwatched[i].src = unwatched[i].getAttribute('data-src');
                    unwatched[i].removeAttribute('data-src');
                    $(unwatched[i].parentNode.parentNode).removeClass('blank');
                    console.log('Loading image... ' + unwatched[i].src);
                });
            }
        },

        loadContent: function(element, done) {
            this.checkViewoport(element, this.contentThreshold, done);
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
