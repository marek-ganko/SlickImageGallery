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

        this.init = function() {
            this.createContainer();
        };

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

        this.startListening = function() {
            window.addEventListener('keyup', this.listeners, false);
        };

        this.stopListening = function() {
            window.removeEventListener('keyup', this.listeners, false);
        };

        this.createContainer = function() {
            var closePreview = document.createElement('div'),
                shortcutsInfo = document.createElement('div');

            this.itemsContainer = document.createElement('ul');
            this.itemsContainer.setAttribute('id', 'previewItems');
            closePreview.setAttribute('id', 'closePreview');
            closePreview.setAttribute('class', 'icon');
            closePreview.onclick = function() {
                _self.hide();
            };
            shortcutsInfo.setAttribute('id', 'shortcutsInfo');
            shortcutsInfo.innerHTML = 'Use shortcuts:<br>next: &rarr; or W<br>previous: &larr; or A<br>exit: Esc';
            shortcutsInfo.onclick = function() {
                shortcutsInfo.style.display = 'none';
            };

            this.container = document.createElement('div');
            this.container.setAttribute('id', 'Preview');
            // #Preview #closePreview
            this.container.appendChild(closePreview);
            // #Preview #shortcutsInfo
            this.container.appendChild(shortcutsInfo);
            // #Preview ul
            this.container.appendChild(this.itemsContainer);
        };

        this.hide = function() {
            this.container.style.display = 'none';
            this.toggleScroll(true);
            this.stopListening();
        };

        this.show = function(image) {
            // clear all previous content
            this.itemsContainer.innerHTML = '';
            this.container.style.display = 'block';
            this.toggleScroll(false);
            this.offset = 0;

            // #Preview figure
            this.itemsContainer.appendChild(this.createView(image, function() {
                _self.currentImage = image;
                _self.startListening();
                _self.getImages('next', image, _self.boundingImages, 0);
                _self.getImages('prev', image, _self.boundingImages, 0, function(createdImages) {
                    _self.setOffset(-100 * createdImages);
                });
            }));
        };

        this.setOffset = function(offset) {
            this.offset += offset;
            this.itemsContainer.style.left = this.offset + '%';
        };

        this.showNext = function() {
            var imageContainer = this.currentImage.parentNode.parentNode,
                wasFirst = this.isFirstImage;

            imageContainer = imageContainer.nextSibling;
            this.setCurrentImage(imageContainer.firstChild.firstChild);

            this.setOffset(-100);

            this.getImages('next', this.currentImage, 1, this.boundingImages, function() {

                if (!wasFirst) {
                    // remove first preview element
                    _self.removeFirst();
                    // move view to left by one page
                    _self.setOffset(100);
                }

                // scroll
                _self.scrollToImage(_self.currentImage);
            });
        };

        this.showPrevious = function() {
            var imageContainer = this.currentImage.parentNode.parentNode;

            imageContainer = imageContainer.previousSibling;
            this.isFirstImage = imageContainer.getAttribute('class') != 'imgContainer';

            if (!this.isFirstImage) {
                this.setCurrentImage(imageContainer.firstChild.firstChild);

                this.setOffset(100);

                this.getImages('prev', this.currentImage, 1, this.boundingImages, function(createdImages) {

                    // remove last preview element
                    _self.removeLast();

                    // move view to right by one page
                    _self.setOffset(-100 * createdImages);

                    // scroll
                    _self.scrollToImage(_self.currentImage);
                });
            }
        };

        this.setCurrentImage = function(image) {
            var containerClass = image.parentNode && image.parentNode.parentNode && image.parentNode.parentNode.getAttribute('class');
            this.currentImage = image;
            this.isFirstImage = containerClass != 'imgContainer';
        };

        this.scrollToImage = function(image) {
            var viewport = document.documentElement.getBoundingClientRect(),
                imageOffset = image.getBoundingClientRect(),
                vieportTop = (viewport.top * (-1));

            window.scrollTo(0, imageOffset.top + vieportTop);
        };

        this.removeFirst = function() {
            this.itemsContainer.removeChild(this.itemsContainer.firstChild);
        };

        this.removeLast = function() {
            this.itemsContainer.removeChild(this.itemsContainer.lastChild);
        };

        this.getImages = function(dir, image, limit, offset, done) {
            var slibling = dir == 'next' ? 'nextSibling' : 'previousSibling',
                imageContainer = image.parentNode.parentNode,
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
            typeof done === 'function' && done(createdImages);
        };

        this.createView = function(image, done) {
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
                typeof done === 'function' && done();
            };
            imageElement.onerror = function() {
                figureElement.innerHTML = '';
                figureElement.setAttribute('class', figureElement.getAttribute('class').replace('blank', 'broken'));
                typeof done === 'function' && done();
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

        this.toggleScroll = function(on) {
            if (on) {
                document.ontouchmove = function(e) {
                    return true;
                };
                document.body.style.overflow = '';
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