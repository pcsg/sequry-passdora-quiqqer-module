/**
 * TODO: Docs
 *
 * @module package/sequry/passdora/bin/js/controls/RestoreDialog
 * @author www.pcsg.de (Jan Wennrich)
 *
 */
define('package/sequry/passdora/bin/js/controls/RestoreDialog', [

    'qui/QUI',
    'qui/controls/windows/Confirm',
    'controls/upload/Form',
    'Ajax',
    'Locale',
    'Mustache',
    'text!package/sequry/passdora/bin/js/controls/RestoreDialog.html',
    'css!package/sequry/passdora/bin/js/controls/RestoreDialog.css'

], function (QUI, QUIConfirm, UploadForm, QUIAjax, QUILocale, Mustache, template) {
    "use strict";

    var lg = 'sequry/passdora';

    return new Class({
        Extends: QUIConfirm,
        Type   : 'package/sequry/passdora/bin/js/controls/RestoreDialog',

        Binds: [
            'onOpen',
            'validateUpload',
            'onUploadComplete',
            'onSubmit',
            'disable',
            'enable',
            'getRestoreInputs',
            'forEachRestoreInput',
            'getRestoreKeyFromInputs'
        ],

        options: {
            title: QUILocale.get(lg, 'restore.panel.title'),
            icon : 'fa fa-undo'
        },

        Form: UploadForm,

        // How many blocks (separated by something e.g. "-") make up the whole restore key?
        restoreKeyBlocks: 5,

        // How many characters are in one block?
        restoreKeyBlockLength: 5,

        initialize: function (options) {
            this.parent(options);

            this.setAttributes({
                'icon'     : 'fa fa-undo',
                'autoclose': false,
                'maxHeight': 400
            });

            this.addEvents({
                onOpen: this.onOpen,
                submit: this.onSubmit
            });
        },


        onOpen: function (Win) {
            var self = this;
            var Content = Win.getContent();
            this.Form = new UploadForm({
                maxuploads: 1
            });

            Content.set({
                html: Mustache.render(template, {
                    locale: {
                        uploadFormHeader: QUILocale.get(lg, 'restore.panel.file.title'),
                        restoreKeyHeader: QUILocale.get(lg, 'restore.panel.key.title')
                    }
                })
            });

            var UploadFormContainer = Content.getElementById('upload-form');

            this.Form.setParam('onfinish', 'package_sequry_passdora_ajax_upload');

            this.Form.addEvents({
                onComplete: this.onUploadComplete
            });

            this.Form.inject(UploadFormContainer);

            this.restoreKeyBlocks = this.getRestoreInputs().length;

            this.forEachRestoreInput(function (Input, index, isLast) {

                Input.setAttribute('maxlength', self.restoreKeyBlockLength);

                // When an input field is full, focus the next one
                if (!isLast) {
                    Input.addEventListener('input', function () {
                        if (Input.value.length === self.restoreKeyBlockLength) {
                            Input.getNext(Input.tagName).select();
                        }
                    });
                }

                // If something is pasted to the first input field, fill all the inputs with the pasted content
                if (index === 0) {
                    Input.addEventListener('paste', function (event) {
                        // Remove dashes from the pasted text
                        var restoreKey = event.clipboardData.getData("Text").replace(/-/g, '');

                        // Explode the string to blocks with the length of a restore key block
                        var restoreKeyBlocks = restoreKey.match(
                            new RegExp('.{1,' + self.restoreKeyBlockLength + '}', 'g')
                        );

                        // Fill the input fields
                        self.forEachRestoreInput(function (Input, index) {
                            if (typeof restoreKeyBlocks[index] !== "undefined") {
                                Input.value = restoreKeyBlocks[index];
                            }
                        });
                    });
                }
            });
        },


        validateUpload: function () {

        },


        onSubmit: function () {
            this.disable();

            this.Form.submit();
        },


        onUploadComplete: function () {
            QUIAjax.post(
                'package_sequry_passdora_ajax_processRestoreFile',
                function (result) {
                    this.enable();
                    if (result.error === false) {
                        this.close();
                    }
                }.bind(this), {
                    'package'   : 'sequry/passdora',
                    'restoreKey': this.getRestoreKeyFromInputs()
                }
            );
        },


        /**
         * Returns the restore-key build from the input elements values
         *
         * @return {string}
         */
        getRestoreKeyFromInputs: function () {
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
//            this.Form.disable();

            this.getElm().getElementById('restore-key').addClass('disabled');

            this.forEachRestoreInput(function (Input) {
                Input.readOnly = true;
            });
        },


        /**
         * Enables all input elements
         */
        enable: function () {
//            this.Form.enable();

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
            return this.getElm().getElementById('restore-key').getElementsByTagName('input');
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
        }
    });
});