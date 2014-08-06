'use strict';
var app = ns('app.lazyLoader');

/**
 * @class app.preview.Standard
 * @extends app.preview.Abstract
 */
app.preview.Standard = (function (window, document) {

    /**
     * @constructor
     */
    return function () {
        var constr = function () {

            var _self = this;
            /**
             * Initialize preview controls
             */
            this.initControls = function () {
                var next = document.createElement('a'),
                    previous = document.createElement('a');

                previous.setAttribute('id', 'prev');
                previous.setAttribute('href', '#prev');
                previous.setAttribute('class', 'controller');
                previous.onclick = function () {
                    _self.showPrevious();
                };
                previous.appendChild(document.createElement('span'));
                this.container.appendChild(previous);

                next.setAttribute('id', 'next');
                next.setAttribute('href', '#next');
                next.setAttribute('class', 'controller');
                next.appendChild(document.createElement('span'));
                next.onclick = function () {
                    _self.showNext();
                };
                this.container.appendChild(next);

                var shortcutsInfo = document.createElement('div');
                shortcutsInfo.setAttribute('id', 'shortcutsInfo');
                shortcutsInfo.innerHTML = 'Use shortcuts:<br>next: &rarr; or W<br>previous: &larr; or A<br>exit: Esc';
                shortcutsInfo.onclick = function () {
                    shortcutsInfo.style.display = 'none';
                };
                this.container.appendChild(shortcutsInfo);
            };
        };

        // extend
        constr.prototype = new app.preview.Abstract(window, document);
        var Standard = new constr();
        Standard.setScope(Standard);
        return Standard;
    };
})(window, document);