(function(screen, window, document, $) {
    "use strict";

    /**
     * Show error message
     * @param {String} message
     * @constructor
     */
    var ErrorMessage = function(message) {
        var messageElement = document.getElementById('Message'),
            galleryElement = document.getElementById('Gallery');

        messageElement.innerHTML = message;
        messageElement.style.display = 'block';
        galleryElement.style.display = 'none';
    };

    /**
     * Gallery - main initiating object
     * @constructor
     */
    var Gallery = function() {
        var self = this;
        this.imageHelper = new Images();
        this.lazyLoader = new LazyLoader();
        this.imageStream = new MediaWikiClient(function(){
            self.init();
        });
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

            this.getImages(function(err) {
                if (err) {
                    return new ErrorMessage(err);
                }
                if (!lazyLoaderCalled){
                    self.lazyLoader.listenForImages();
                    lazyLoaderCalled = true;
                }
                self.lazyLoader.loadThumbnail.call(self.lazyLoader);
            });
        },

        createContainer: function() {
            this.container = document.createElement('div');
            this.container.setAttribute('id', 'Gallery');
            this.bottomTriggerElement = document.createElement('div');
            this.bottomTriggerElement.setAttribute('id', 'bottomTrigger');

            // #Gallery #Images
            this.container.appendChild(this.imageHelper.container);
            // #Gallery #bottomTrigger
            this.container.appendChild(this.bottomTriggerElement);
            // body #Gallery
            document.body.appendChild(this.container);
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

    /**
     * Images handling
     * @constructor
     */
    var Images = function() {
        this.preview = new Preview();
        this.init();
    };
    Images.prototype = {
        container: null,
        preview: null,
        list: [],

        init: function() {
            this.createContainer();
        },

        createContainer: function() {
            this.container = document.createElement('div');
            this.container.setAttribute('id', 'Images');
            // #Images #Preview
            this.container.appendChild(this.preview.container);
        },

        createList: function(images, done) {
            for (var i in images) {
                // #Images .imgContainer
                this.container.appendChild(this.create(images[i]));
            }
            done();
        },

        create: function(image) {
            var imageContainer = document.createElement('div'),
                link = document.createElement('a'),
                imageElement = new Image(),
                self = this,
                size = image.width + ' x ' + image.height + ' (' + this.bytesToSize(image.size) + ')';

            imageContainer.setAttribute('class', 'imgContainer blank');

            link.setAttribute('href', image.src);
            link.setAttribute('title', image.name + ' - ' + size);

            imageElement.setAttribute('data-thumb', image.thumb);
            imageElement.setAttribute('data-url', image.url);
            imageElement.setAttribute('data-src', image.src);
            imageElement.setAttribute('data-size', size);

            imageElement.setAttribute('alt', image.name);

            this.list.push(imageElement);

            link.onclick = function(e) {
                e.preventDefault();
                self.preview.show.call(self.preview, imageElement);
            };

            // a img
            link.appendChild(imageElement);
            // .imgContainer a
            imageContainer.appendChild(link);
            return imageContainer;
        },

        bytesToSize: function(bytes) {
            if (bytes == 0) {
                return '0 Byte';
            }
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
                i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }
    };

    /**
     * Image Preview handling
     * @constructor
     */
    var Preview = function() {
        this.init();
        this.listen();
    };
    Preview.prototype = {
        container: null,
        itemsContainer: null,

        init: function() {
            this.createContainer();
        },

        listen: function() {
            var self = this;

            // close on ESC
            window.addEventListener('keyup', function(e) {
                if (e.keyCode == 27) {
                    self.hide();
                }
            }, false);
        },

        createContainer: function() {
            var self = this,
                closePreview = document.createElement('div');

            this.itemsContainer = document.createElement('div');
            this.itemsContainer.setAttribute('id', 'previewItems');
            closePreview.setAttribute('id', 'closePreview');
            closePreview.onclick = function() {
                self.hide();
            };

            this.container = document.createElement('div');
            this.container.setAttribute('id', 'Preview');
            // #Preview #closePreview
            this.container.appendChild(closePreview);
            // #Preview #previewItems
            this.container.appendChild(this.itemsContainer);
        },

        hide: function() {
            this.container.style.display = 'none';
            this.toggleScroll(true);
        },

        show: function(image) {
            // clear all previous content
            this.itemsContainer.innerHTML = '';
            this.container.style.display = 'block';
            this.toggleScroll(false);

            this.getImages('next', image, 2);
            this.getImages('prev', image, 2);

            // #Preview figure
            this.itemsContainer.appendChild(this.createFigure(image));
        },

        getImages: function(dir, image, limit) {
            var slibling = dir == 'next' ? 'nextSibling' : 'previousSibling',
                imageContainer = image.parentNode.parentNode,
                i = 0;

            // move one slibling
            imageContainer = imageContainer[slibling];
            while (imageContainer && i < limit) {
                if (imageContainer.nodeType == 1) {
                    var figure = this.createFigure(imageContainer.firstChild.firstChild);
                    if (dir == 'next') {
                        this.itemsContainer.appendChild(figure);
                    } else {
                        this.itemsContainer.insertBefore(figure, this.itemsContainer.firstChild);
                    }
                }
                imageContainer = imageContainer[slibling];
                i++;
            }

        },

        createFigure: function(image) {
            // @TODO add additional layer for better image responsive with always visible caption
            // @TODO add image loading indicator

            var sourceLink = document.createElement('a'),
                figureElement = document.createElement('figure'),
                figcaptionElement = document.createElement('figcaption'),
                imageElement = new Image();

            sourceLink.setAttribute('href', image.getAttribute('data-url'));
            sourceLink.setAttribute('target', '_blank');
            sourceLink.appendChild(document.createTextNode('source image'));

            figcaptionElement.innerHTML = image.getAttribute('data-size') + '<br>';
            figcaptionElement.appendChild(sourceLink);

            imageElement.onload = function() {
            };

            imageElement.setAttribute('src', image.getAttribute('data-src'));

            // figure img
            figureElement.appendChild(imageElement);
            // figure figcaption
            figureElement.appendChild(figcaptionElement);

            return figureElement;
        },

        toggleScroll: function(on) {
            document.body.style.overflow = on ? '' : 'hidden';
        }

    };

    /**
     *
     * @param {*} done
     * @constructor
     */
    var MediaWikiClient = function(done) {
        this.init(done);
    };
    MediaWikiClient.prototype = {
        url: 'http://en.wikipedia.org/w/api.php?action=query&format=json&callback=?',
        queryParams: {
            list: 'allimages',
            aisort: 'timestamp',
            aidir: 'descending',
            aiprop: 'url|mediatype|mime|size',
            ailimit: 100
        },
        maxThumbWidth: 300,
        maxPreviewWidth: screen.width,
        thumbUrl: '',
        rootUrl: '',

        init: function(done) {
            var self = this;
            $.getJSON(this.buildQuery(this.url, {meta: 'filerepoinfo', friprop: 'thumbUrl|rootUrl'}), function(data) {
                self.thumbUrl = data.query && data.query.repos && data.query.repos[1] && data.query.repos[1].thumbUrl || '';
                self.rootUrl = data.query && data.query.repos && data.query.repos[1] && data.query.repos[1].rootUrl || '';
                done();
            });
        },

        getList: function(done) {
            var self = this;
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

            this.queryParams.aicontinue = data['query-continue'] && data['query-continue'].allimages.aicontinue || '';
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
                image.thumb = this.shrinkImage(image, this.maxThumbWidth, 400);
                image.src = this.shrinkImage(image, this.maxPreviewWidth, 400);
            }

            return data.filter(function(value){
                return value;
            });
        },

        shrinkImage: function(image, maxWidth, decreaseBoundary) {
            return image.width - decreaseBoundary < maxWidth ?
                image.url :
                image.url.replace(this.rootUrl, this.thumbUrl) + '/' + maxWidth + 'px-' + image.name;
        }
    };

    /**
     * Handling lazy loading for images
     * @constructor
     */
    var LazyLoader = function() {
    };
    LazyLoader.prototype = {
        imagesThreshold: 2000,
        contentThreshold: 4000,

        listenForImages: function() {
            window.addEventListener('resize', this.debounce(this.loadThumbnail.bind(this), 10), false);
            document.addEventListener('scroll', this.debounce(this.loadThumbnail.bind(this), 10), false);
            document.addEventListener('touchstart', this.debounce(this.loadThumbnail.bind(this), 10), false);
        },

        listenForContent: function(triggerElement, done) {
            window.addEventListener('resize', this.debounce(this.loadContent.bind(this, triggerElement, done), 100), false);
            document.addEventListener('scroll', this.debounce(this.loadContent.bind(this, triggerElement, done), 100), false);
            document.addEventListener('touchstart', this.debounce(this.loadContent.bind(this, triggerElement, done), 100), false);

            this.loadContent(triggerElement, done);
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

        loadThumbnail: function() {
            var unwatched = document.querySelectorAll('img[data-thumb]');
            for (var i in unwatched) {
                if (unwatched[i].parentNode && unwatched[i].parentNode.parentNode) {
                    this.checkViewoport(unwatched[i].parentNode.parentNode, this.imagesThreshold, function(imageContainer) {
                        var image = imageContainer.firstChild.firstChild;
                        image.onload = function() {
                            imageContainer.setAttribute('class', imageContainer.getAttribute('class').replace('blank', '').trim());
                        };
                        image.onerror = function() {
                            imageContainer.innerHTML = '';
                            imageContainer.setAttribute('class', imageContainer.getAttribute('class').replace('blank', 'broken'));
                        };
                        image.setAttribute('src', image.getAttribute('data-thumb'));
                        image.removeAttribute('data-thumb');
                    });
                }
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

            return elementOffset.top + vieportTop > screenHeight + vieportTop + threshold || done(element);
        }
    };

    var gallery = new Gallery();

})(screen, window, document, jQuery);
