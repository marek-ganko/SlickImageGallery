'use strict';

(function() {
    var App = new AppBuilder(jQuery),
        Gallery = App.getGallery();

    Gallery.setImagesLimitPerRequest(120).init();
})();