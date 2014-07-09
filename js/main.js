"use strict";

document.onload = function() {

    var App = new AppBuilder(),
        Gallery = App.getGallery();

    Gallery.init();

};