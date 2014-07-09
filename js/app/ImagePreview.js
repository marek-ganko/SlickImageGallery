"use strict";
var app = ns('app');

/**
 * @class app.ImagePreview
 */
app.ImagePreview = (function() {

    /**
     * @constructor
     */
    return function() {

        var _self = this;

        this.container = null;
        this.itemsContainer = null;
        this.offset = 0;
        this.boundingImages = 2;
        this.isFirstImage = true;
        this.currentImage = null;

        /**
         * Initialize preview
         */
        this.init = function() {
            this.createContainer();
        };

        /**
         * listeners for preview control
         * @param {EventTarget} e
         */
        this.listeners = function(e) {
            // close on ESC
            if (e.keyCode == 27) {
                _self.hide();
            }
            // show previous picture on left and A
            if (e.keyCode == 37 || e.keyCode == 65) {
                _self.showPrevious();
            }
            // show next picture on right and D
            if (e.keyCode == 39 || e.keyCode == 68) {
                _self.showNext();
            }
        };

        /**
         * Adds liteners
         */
        this.startListening = function() {
            window.addEventListener('keyup', this.listeners, false);
        };

        /**
         * Removes listeners
         */
        this.stopListening = function() {
            window.removeEventListener('keyup', this.listeners, false);
        };

        /**
         * Creates prieview DOM container
         */
        this.createContainer = function() {
            var closePreview = document.createElement('div');

            this.itemsContainer = document.createElement('ul');
            this.itemsContainer.setAttribute('id', 'previewItems');
            closePreview.setAttribute('id', 'closePreview');
            closePreview.setAttribute('class', 'icon');
            closePreview.onclick = function() {
                _self.hide();
            };

            this.container = document.createElement('div');
            this.container.setAttribute('id', 'Preview');
            // #Preview #closePreview
            this.container.appendChild(closePreview);

            // #Preview ul
            this.container.appendChild(this.itemsContainer);

            if (!app.isMobile) {
                var shortcutsInfo = document.createElement('div');
                shortcutsInfo.setAttribute('id', 'shortcutsInfo');
                shortcutsInfo.innerHTML = 'Use shortcuts:<br>next: &rarr; or W<br>previous: &larr; or A<br>exit: Esc';
                shortcutsInfo.onclick = function() {
                    shortcutsInfo.style.display = 'none';
                };
                // #Preview #shortcutsInfo
                this.container.appendChild(shortcutsInfo);
            }
        };

        /**
         * Get Images from Gallery image list
         * @param {String} dir
         * @param {HTMLElement} currentImage
         * @param {Number} limit
         * @param {Number} offset
         * @param {Callback} callback
         */
        this.getImages = function(dir, currentImage, limit, offset, callback) {
            var slibling = dir == 'next' ? 'nextSibling' : 'previousSibling',
                imageContainer = currentImage.parentNode.parentNode,
                i = 0,
                createdImages = 0;

            imageContainer = imageContainer[slibling];
            while (imageContainer && imageContainer.getAttribute('class') == 'imgContainer' && i < limit + offset) {
                ++i;

                if (offset > i - 1) {
                    continue;
                }

                if (imageContainer.nodeType == 1) {
                    var figure = this.createView(imageContainer.firstChild.firstChild);
                    if (dir == 'next') {
                        // ul:after li
                        this.itemsContainer.appendChild(figure);
                    } else {
                        // ul:before li
                        this.itemsContainer.insertBefore(figure, this.itemsContainer.firstChild);
                        this.isFirstImage = false;
                    }
                    ++createdImages;
                }
                imageContainer = imageContainer[slibling];
            }
            typeof callback === 'function' && callback(null, createdImages);
        };

        /**
         * Hide preview
         */
        this.hide = function() {
            jQuery(this.container).fadeOut();
            this.toggleListenScroll(true);
            this.stopListening();
        };

        /**
         * Show preview
         * @param {HTMLElement} image
         */
        this.show = function(image) {
            // clear all previous content
            this.itemsContainer.innerHTML = '';
            jQuery(this.container).fadeIn();
            this.toggleListenScroll(false);
            this.offset = 0;

            // #Preview figure
            this.itemsContainer.appendChild(this.createView(image, function(error) {
                if (error) {
                    return error;
                }
                _self.currentImage = image;
                _self.startListening();
                _self.getImages('next', image, _self.boundingImages, 0);
                _self.getImages('prev', image, _self.boundingImages, 0, function(error, createdImages) {
                    return error || _self.setOffset(-100 * createdImages);
                });
            }));
        };

        /**
         * Creates preview DOM elements
         * @param {HTMLElement} image
         * @param {Callback} callback
         * @returns {HTMLElement}
         */
        this.createView = function(image, callback) {
            var sourceLink = document.createElement('a'),
                viewElement = document.createElement('li'),
                figureElement = document.createElement('figure'),
                figcaptionElement = document.createElement('figcaption'),
                imageElement = new Image(),
                imageContainer = document.createElement('div'),
                next = document.createElement('div'),
                previous = document.createElement('div');

            figureElement.setAttribute('class', 'blank');

            imageContainer.setAttribute('class', 'bigImageContainer');
            next.setAttribute('class', 'icon next');
            next.onclick = function() {
                _self.showNext();
            };
            // .bigImageContainer .next
            imageContainer.appendChild(next);

            previous.setAttribute('class', 'icon previous');
            previous.onclick = function() {
                _self.showPrevious();
            };
            // .bigImageContainer .previous
            imageContainer.appendChild(previous);

            sourceLink.setAttribute('href', image.getAttribute('data-url'));
            sourceLink.setAttribute('target', '_blank');
            sourceLink.appendChild(document.createTextNode('source image'));

            figcaptionElement.innerHTML = image.getAttribute('data-size') + '<br>';
            figcaptionElement.appendChild(sourceLink);

            imageElement.onload = function() {
                figureElement.removeAttribute('class');
                typeof callback === 'function' && callback(null);
            };
            imageElement.onerror = function() {
                figureElement.innerHTML = '';
                figureElement.setAttribute('class', figureElement.getAttribute('class').replace('blank', 'broken'));
                typeof callback === 'function' && callback(null);
            };

            imageElement.setAttribute('src', image.getAttribute('data-src'));

            // .bigImageContainer img
            imageContainer.appendChild(imageElement);
            // figure figcaption
            imageContainer.appendChild(figcaptionElement);
            // figure .bigImageContainer
            figureElement.appendChild(imageContainer);
            // li figure
            viewElement.appendChild(figureElement);

            return viewElement;
        };

        /**
         * Set style offset of container
         * @param {Number} offset
         */
        this.setOffset = function(offset) {
            this.offset += offset;
            this.itemsContainer.style.left = this.offset + '%';
        };

        /**
         * Show next image
         */
        this.showNext = function() {
            var imageContainer = this.currentImage.parentNode.parentNode,
                wasFirst = this.isFirstImage;

            imageContainer = imageContainer.nextSibling;
            this.setCurrentImage(imageContainer.firstChild.firstChild);

            this.setOffset(-100);

            this.getImages('next', this.currentImage, 1, this.boundingImages, function(error) {
                if (error) {
                    return error;
                }
                if (!wasFirst) {
                    // remove first preview element
                    _self.removeFirst();
                    // move view to left by one page
                    _self.setOffset(100);
                }

                console.log(_self.currentImage);
                // scroll
                _self.scrollToImage(_self.currentImage);
            });
        };

        /**
         * Show previous image
         */
        this.showPrevious = function() {
            var imageContainer = this.currentImage.parentNode.parentNode;

            imageContainer = imageContainer.previousSibling;
            this.isFirstImage = imageContainer.getAttribute('class') != 'imgContainer';

            if (!this.isFirstImage) {
                this.setCurrentImage(imageContainer.firstChild.firstChild);

                this.setOffset(100);

                this.getImages('prev', this.currentImage, 1, this.boundingImages, function(error, createdImages) {
                    if (error) {
                        return error;
                    }
                    // remove last preview element
                    _self.removeLast();

                    // move view to right by one page
                    _self.setOffset(-100 * createdImages);

                    console.log(_self.currentImage);

                    // scroll
                    _self.scrollToImage(_self.currentImage);
                });
            }
        };

        /**
         * Set current visible image
         * @param {HTMLElement} image
         */
        this.setCurrentImage = function(image) {
            var containerClass = image.parentNode && image.parentNode.parentNode && image.parentNode.parentNode.getAttribute('class');
            this.currentImage = image;
            this.isFirstImage = containerClass != 'imgContainer';
        };

        /**
         * Scroll window to passed image top
         * @param {HTMLElement} image
         */
        this.scrollToImage = function(image) {
            var viewport = document.documentElement.getBoundingClientRect(),
                imageOffset = image.parentNode.parentNode.getBoundingClientRect(),
                vieportTop = Math.abs(viewport.top);

            console.log(image.parentNode.parentNode, imageOffset.top, vieportTop, imageOffset.top + vieportTop);

            window.scrollTo(0, imageOffset.top + vieportTop);
        };

        /**
         * Remove first image with its container
         */
        this.removeFirst = function() {
            this.itemsContainer.removeChild(this.itemsContainer.firstChild);
        };

        /**
         * Remove last image with its container
         */
        this.removeLast = function() {
            this.itemsContainer.removeChild(this.itemsContainer.lastChild);
        };

        /**
         * Toggle Listener on Scroll - mobile mainly
         * @param {Boolean} on
         */
        this.toggleListenScroll = function(on) {
            if (on) {
                document.ontouchmove = function(e) {
                    return true;
                };
                document.body.style.overflow = '';
            } else {
                document.ontouchmove = function(e) {
                    e.preventDefault();
                    return false;
                };
                document.body.style.overflow = 'hidden';
            }
        }
    };
})();