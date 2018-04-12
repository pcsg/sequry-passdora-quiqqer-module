/**
 * Displays a dialog which displays the system status
 *
 * @module package/sequry/passdora/bin/js/controls/dialogs/Status
 * @author www.pcsg.de (Jan Wennrich)
 *
 */
define('package/sequry/passdora/bin/js/controls/dialogs/Status', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'Locale',

    'css!package/sequry/passdora/bin/js/controls/dialogs/Status.css'

], function (QUI, QUIPopup, QUILocale) {
    "use strict";

    var lg = 'sequry/passdora';

    return new Class({
        Extends: QUIPopup,
        Type   : 'package/sequry/passdora/bin/js/controls/dialogs/Status',

        Binds: [],

        options: {
            title: QUILocale.get(lg, 'status.panel.title'),
            icon : 'fa fa-heartbeat'
        },

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onOpen: this.onPopupOpen
            });
        },


        /**
         * Fired when the dialog is opened.
         * Constructs all the controls and elements.
         *
         * @param Win
         */
        onPopupOpen: function (Win) {
            var Content = Win.getContent();

            Content.setStyle('padding', 0);

            this.Loader.show();

            var IFrame = new Element('iframe', {
                id : 'status',
                src: 'http://passdora.local:81'
            });

            IFrame.addEvent('load', function () {
                this.Loader.hide();
            }.bind(this));

            IFrame.inject(Content);
        }
    });
});