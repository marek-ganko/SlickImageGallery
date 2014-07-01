(function(window, document, $) {
    "use strict";

    var Gallery = function() {
        this.imageStream = new MediaWikiClient();
        this.imageHelper = new Images();
        this.init();
    };

    Gallery.prototype = {
        container: null,

        init: function() {
            var self = this;
            this.createContainer(function() {
                this.getImages.call(this, function() {
                    self.container.appendChild(self.imageHelper.container);
                });
            });
        },

        createContainer: function(done) {
            this.container = document.createElement('div');
            this.container.id = 'Gallery';
            document.body.appendChild(this.container);
            done.call(this);
        },

        getImages: function(done) {
            var self = this;

            this.imageStream.getList(function(data) {
                console.log('imageList', data);

                self.imageHelper.createList(data, function() {
                    console.log('list created', this);
                    done();
                });
            });
        }
    };

    var Images = function() {
        this.init();
        this.listen();
    };

    Images.prototype = {
        watched: [],
        unwatched: [],
        container: null,

        init: function() {
            this.createContainer();
        },

        listen: function() {
            // @TODO handle swipe too
            // @TODO add debounce
            document.addEventListener('scroll', this.lazyLoad.bind(this), false);
            window.addEventListener('load', this.lazyLoad.bind(this), false);
            window.addEventListener('resize', this.lazyLoad.bind(this), false);
        },

        lazyLoad: function() {
            var self = this;
            for (var i in this.unwatched) {
                this.show(this.unwatched[i], function() {
                    self.watched.push(self.unwatched[i]);
                    self.unwatched.splice(i, 1);
                });
            }
        },

        show: function(image, done) {
            var screen = image.getBoundingClientRect();
            var visible = screen.top >= 0 && screen.left >= 0 && screen.top <= (window.innerHeight || document.documentElement.clientHeight);
            if (visible) {
                console.log('showImage', image);
                image.src = image.getAttribute('data-url');
                done();
            }
        },

        createContainer: function() {
            this.container = document.createElement('div');
            this.container.id = 'Images';
        },

        appendContainer: function(partial, done) {
            this.container.appendChild(partial);
            document.body.appendChild(this.container);
            done();
        },

        createList: function(images, done) {
            var partial = document.createElement('span');
            for (var i in images) {
                partial = this.create(images[i], partial);
            }
            this.appendContainer(partial, done);
        },

        create: function(image, container) {
            var activeElement = this.createPreviewLink(container);

            // @TODO Add blank image on start
            // @TODO normalize images sizes
            var imageElement = document.createElement('img');
            imageElement.setAttribute('data-url', image.url);
            imageElement.setAttribute('data-source', image.descriptionurl);
            imageElement.setAttribute('title', image.title);
            imageElement.setAttribute('width', image.width);
            imageElement.setAttribute('height', image.height);

            this.unwatched.push(imageElement);

            activeElement.appendChild(imageElement);
            return container;
        },

        createPreviewLink: function(container) {
            var link = document.createElement('a');

            link.onclick = function() {
                // @TODO bind z preview on click

            };

            container.appendChild(link);
            return link;
        }
    };

    var MediaWikiClient = function() {};
    MediaWikiClient.prototype = {
        url: 'http://en.wikipedia.org/w/api.php?action=query&format=json&callback=?',
        queryParams: {
            list: 'allimages',
            aisort: 'name',
            aiprop: 'url|size',
            ailimit: 200
        },

        getList: function(done) {
            var self = this;
            $.getJSON(this.buildQuery(this.url, this.queryParams), function(data) {
                done(self.parseResults(data));
            });
        },

        buildQuery: function(url, params) {
            for (var name in params) {
                url += '&' + name + '=' + encodeURIComponent(params[name]);
            }
            return url;
        },

        parseResults: function(data) {
            this.queryParams.aicontinue = data['query-continue'] && data['query-continue'].allimages.aicontinue || null;
            return data.query && data.query.allimages || [];
        }
    };

    var gallery = new Gallery();

})(window, document, jQuery);
