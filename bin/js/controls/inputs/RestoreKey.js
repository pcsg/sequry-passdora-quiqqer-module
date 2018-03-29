/**
 * A control that displays inputs to read a restore key.
 *
 * @module package/sequry/passdora/bin/js/controls/inputs/RestoreKey
 *
 * @author www.pcsg.de (Jan Wennrich)
 *
 * @event onInputFull - Fired when all inputs fields are filled
 * @event onInput - Fired when something is written into any input field
 */
define('package/sequry/passdora/bin/js/controls/inputs/RestoreKey', [

    'qui/QUI',
    'qui/controls/Control',
    'Mustache',
    'text!package/sequry/passdora/bin/js/controls/inputs/RestoreKey.html'

], function (QUI, QUIControl, Mustache, template) {
    "use strict";

    var lg = 'sequry/passdora';

    return new Class({
        Extends: QUIControl,
        Type   : 'package/sequry/passdora/bin/js/controls/inputs/RestoreKey',

        Binds: [
            'create',
            'disable',
            'enable',
            'forEachRestoreInput',
            'getRestoreInputs',
            'getInput',
            'getRestoreKeyLength',
            'initialize',
            'onInput',
            'onPaste'
        ],

        options: {
            // How many blocks (separated by something e.g. "-") make up the whole restore key?
            blocks: 5,

            // How many characters are in one block?
            blockLength: 5
        },


        initialize: function (options) {
            options = options || {};

            this.parent(options);
        },


        /**
         * Fired when the dialog is opened.
         * Constructs all the controls and elements.
         *
         * @param Win
         */
        create: function (Win) {
            var self = this;

            var Elm = new Element('div', {
                'id': 'restore-key-input'
            });

            var blocksAmount = this.getAttribute('blocks');
            var blockLength = this.getAttribute('blockLength');

            for (var i = 0; i < blocksAmount; i++) {
                var Input = new Element('input', {
                    type     : 'text',
                    'class'  : 'restore-key-block',
                    size     : blockLength,
                    maxlength: blockLength
                });

                Input.addEventListener('input', self.onInput);

                // If it is the first input
                if (i === 0) {
                    Input.addEventListener('paste', self.onPaste);
                }

                Elm.appendChild(Input);

                // If it is not the last input
                if (i < blocksAmount - 1) {
                    Elm.appendChild(new Element('span', {
                        'class': 'restore-key-separator',
                        html   : '-'
                    }));
                }
            }

            this.$Elm = Elm;

            return this.$Elm;
        },


        /**
         * Fired when something is typed in to an input
         *
         * @param event
         */
        onInput: function (event) {
            var Input = event.target;

            this.fireEvent('input', [Input]);

            // When an input field is full...
            if (Input.value.length === this.getAttribute('blockLength')) {
                // ...and the input is not the last one
                if (Input.nextSibling) {
                    // ...focus the next one
                    Input.getNext(Input.tagName).select();
                }

                // ...and the text in all inputs is as long as a restore key
                if (this.getInput().length === this.getRestoreKeyLength()) {
                    this.fireEvent('inputFull');
                }
            }
        },


        /**
         * Fired when something is pasted to an input
         *
         * @param event
         */
        onPaste: function (event) {
            // Remove dashes from the pasted text
            var restoreKey = event.clipboardData.getData("Text").replace(/-/g, '');

            // Explode the string to blocks with the length of a restore key block
            var restoreKeyBlocks = restoreKey.match(
                new RegExp('.{1,' + this.getAttribute('blockLength') + '}', 'g')
            );

            // Fill the input fields
            this.forEachRestoreInput(function (Input, index) {
                if (typeof restoreKeyBlocks[index] !== "undefined") {
                    Input.value = restoreKeyBlocks[index];
                }
            });
        },


        /**
         * Returns the restore-key build from the input elements values
         *
         * @return {string}
         */
        getInput: function () {
            var restoreKey = "";

            this.forEachRestoreInput(function (Input, index, isLast) {
                restoreKey += Input.value;
                if (!isLast) {
                    restoreKey += "-";
                }
            });
            return restoreKey;
        },


        /**
         * Disables all input elements
         */
        disable: function () {
            this.getElm().getElementById('restore-key').addClass('disabled');

            this.forEachRestoreInput(function (Input) {
                Input.readOnly = true;
            });
        },


        /**
         * Enables all input elements
         */
        enable: function () {
            this.getElm().getElementById('restore-key').removeClass('disabled');

            this.forEachRestoreInput(function (Input) {
                Input.readOnly = false;
            });
        },


        /**
         * Returns a list of the restore key input elements
         *
         * @return {NodeListOf<Element>}
         */
        getRestoreInputs: function () {
            return this.getElm().getElementsByTagName('input');
        },


        /**
         * Executes a given function for each restore key input element
         * The given function is calles with the following parameters:
         *  Element input: the current input element
         *  int index: the input's index
         *  boolean isLast: is the current input the last one?
         *
         * @param {function} func
         */
        forEachRestoreInput: function (func) {
            var restoreInputs = this.getRestoreInputs();
            for (var i = 0; i < restoreInputs.length; i++) {
                var isLast = (i === restoreInputs.length - 1);
                func(restoreInputs[i], i, isLast);
            }
        },


        /**
         * Returns how long a restore key is (including separators)
         *
         * @return {number}
         */
        getRestoreKeyLength: function () {
            return this.getAttribute('blockLength') * this.getAttribute('blocks') + this.getAttribute('blocks') - 1;
        }
    });
});