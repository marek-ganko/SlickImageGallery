'use strict';

(function() {
    var App = new AppBuilder(),
        Gallery = App.getGallery();

    Gallery.setImagesLimitPerRequest(120).init();
})();