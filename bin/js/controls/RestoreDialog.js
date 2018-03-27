/**
 * TODO: Docs
 *
 * @module package/sequry/passdora/bin/js/controls/RestoreDialog
 * @author www.pcsg.de (Jan Wennrich)
 *
 */
define('package/sequry/passdora/bin/js/controls/RestoreDialog', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'qui/controls/buttons/Button',
    'controls/upload/Form',
    'Ajax',
    'Locale',
    'Mustache',
    'text!package/sequry/passdora/bin/js/controls/RestoreDialog.html',
    'css!package/sequry/passdora/bin/js/controls/RestoreDialog.css'

], function (QUI, QUIPopup, QUIButton, UploadForm, QUIAjax, QUILocale, Mustache, template) {
    "use strict";

    var lg = 'sequry/passdora';

    return new Class({
        Extends: QUIPopup,
        Type   : 'package/sequry/passdora/bin/js/controls/RestoreDialog',

        Binds: [
            'onOpen',
            'onClose',
            'validateUpload',
            'onUploadFileAdded',
            'onUploadFileRemoved',
            'onUploadComplete',
            'onSubmit',
            'disable',
            'enable',
            'getRestoreInputs',
            'forEachRestoreInput',
            'getRestoreKeyFromInputs',
            'showStep',
            'showPreviousStep',
            'showNextStep',
            'abortRestore',
            'abortRestoreClick'
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

        // The currently active step
        activeStep: 0,

        initialize: function (options) {
            this.parent(options);

            this.setAttributes({
                'icon'     : 'fa fa-undo',
                'autoclose': false,
                'maxHeight': 400,
                'closeButton': false
            });

            this.addEvents({
                onOpen : this.onOpen,
                onClose: this.onClose
            });
        },


        /**
         * Fired when the dialog is opened.
         * Constructs all the controls and elements.
         *
         * @param Win
         */
        onOpen: function (Win) {
            var self = this;
            var Content = Win.getContent();

            this.isRestoreRequested().then(function (isRestoreRequested) {
                if (isRestoreRequested) {
                    Content.set({
                        html: Mustache.render(template, {
                            locale            : {
                                finish: {
                                    title      : QUILocale.get(lg, 'restore.panel.finish.title'),
                                    description: QUILocale.get(lg, 'restore.panel.finish.description'),
                                    abortRestore: QUILocale.get(lg, 'restore.panel.finish.abortRestore')
                                }
                            },
                            isRestoreRequested: isRestoreRequested
                        })
                    });

                    var AbortButton = new QUIButton({
                        name     : 'abort',
                        textimage: 'fa fa-ban',
                        text     : QUILocale.get(lg, 'restore.panel.button.abort'),
                        'class'  : 'btn-red'
                    }).addEvent('click', self.abortRestoreClick);
                    self.addButton(AbortButton);
                } else {
                    var NextButton = new QUIButton({
                        name     : 'next',
                        textimage: 'fa fa-chevron-right',
                        text     : QUILocale.get(lg, 'restore.panel.button.next')
                    }).addEvent('click', self.showNextStep);

                    var PreviousButton = new QUIButton({
                        name     : 'previous',
                        textimage: 'fa fa-chevron-left',
                        text     : QUILocale.get(lg, 'restore.panel.button.previous')
                    }).addEvent('click', self.showPreviousStep);

                    PreviousButton.disable();
                    NextButton.disable();

                    self.addButton(NextButton);
                    self.addButton(PreviousButton);

                    self.Form = new UploadForm({
                        maxuploads: 1
                    });

                    Content.set({
                        html: Mustache.render(template, {
                            locale: {
                                uploadForm: {
                                    title      : QUILocale.get(lg, 'restore.panel.file.title'),
                                    description: QUILocale.get(lg, 'restore.panel.file.description')
                                },
                                restoreKey: {
                                    title      : QUILocale.get(lg, 'restore.panel.key.title'),
                                    description: QUILocale.get(lg, 'restore.panel.key.description')
                                },
                                finish    : {
                                    title      : QUILocale.get(lg, 'restore.panel.finish.title'),
                                    description: QUILocale.get(lg, 'restore.panel.finish.description')
                                }
                            },
                            isRestoreRequested : isRestoreRequested
                        })
                    });

                    var UploadFormContainer = Content.getElementById('upload-form');

                    self.Form.setParam('onfinish', 'package_sequry_passdora_ajax_upload');

                    self.Form.addEvents({
                        onComplete    : self.onUploadComplete,
                        onAdd         : self.onUploadFileAdded,
                        onInputDestroy: self.onUploadFileRemoved
                    });

                    self.Form.inject(UploadFormContainer);

                    self.restoreKeyBlocks = self.getRestoreInputs().length;

                    self.forEachRestoreInput(function (Input, index, isLast) {

                        Input.setAttribute('maxlength', self.restoreKeyBlockLength);

                        Input.addEventListener('input', function () {
                            var restoreKeyLength = self.restoreKeyBlockLength * self.restoreKeyBlocks;

                            // Add the amount of spacing dashes
                            restoreKeyLength += self.restoreKeyBlocks - 1;

                            // When an input field is full...
                            if (Input.value.length === self.restoreKeyBlockLength) {
                                if (!isLast) {
                                    // ...focus the next one
                                    Input.getNext(Input.tagName).select();
                                }

                                // If the given input is as long as a restore key enable the next-button
                                if (self.getRestoreKeyFromInputs().length === restoreKeyLength) {
                                    self.getButton('next').enable();
                                }
                            } else {
                                // If the input field isn't full yet disable the button
                                self.getButton('next').disable();
                            }
                        });


                        // If something is pasted to the first input field, fill all the inputs with the pasted content
                        if (index === 0) {
                            Input.addEventListener('paste', function (event) {
                                // Remove dashes from the pasted text
                                var restoreKey = event.clipboardData.getData("Text").replace(/-/g, '');

                                // If the pasted key hast the right length enable the next-Button
                                if (restoreKey.length >= self.restoreKeyBlockLength * self.restoreKeyBlocks) {
                                    self.getButton('next').enable();
                                }

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
                }
            });
        },


        /**
         * Fired when this dialog is closed.
         * Destroys this control to reset all variables and controls
         */
        onClose: function () {
            // Destroy the form to reset all variables and controls
            this.destroy();
        },


        /**
         * Submits the form.
         */
        submit: function () {
            this.getButton('previous').disable();
            this.Loader.show();
            this.Form.submit();
        },


        /**
         * Fired when a file is added to the upload form.
         * Enables the next-button.
         *
         * @param UploadForm
         * @param File
         */
        onUploadFileAdded: function (UploadForm, File) {
            this.getButton('next').enable();
        },


        /**
         * Fired when a file is removed from the upload form.
         * Disables the next-button.
         */
        onUploadFileRemoved: function () {
            this.getButton('next').disable();
        },


        /**
         * Fired when the file-upload is complete.
         */
        onUploadComplete: function () {
            var self = this;
            QUIAjax.post(
                'package_sequry_passdora_ajax_processRestoreFile',
                function (result) {
                    self.Loader.hide();
                    if (result.error === false) {
                        // calling showNextStep here would cause an infinite loop
                        self.showStep(self.activeStep + 1);
                    } else {
                        self.getButton('previous').enable();
                        QUI.getMessageHandler().then(function (MH) {
                            MH.addError(
                                result.message,
                                self.getButton('next').getElm()
                            );
                        });
                    }
                }, {
                    'package'   : 'sequry/passdora',
                    'restoreKey': self.getRestoreKeyFromInputs()
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
        },


        /**
         * Shows the step with the given index
         *
         * @param index
         */
        showStep: function (index) {
            var steps = this.getSteps();
            var stepIndicators = this.getStepIndicators();

            var NextButton = this.getButton('next');
            var PreviousButton = this.getButton('previous');

            steps[this.activeStep].style.display = 'none';
            steps[index].style.display = 'block';

            stepIndicators[this.activeStep].removeClass('active');
            stepIndicators[index].addClass('active');

            if (steps[index].id === "restore-key") {
                NextButton.setAttributes({
                    textimage: 'fa fa-paper-plane',
                    text     : QUILocale.get(lg, 'restore.panel.button.submit')
                });
            } else {
                NextButton.setAttributes({
                    textimage: 'fa fa-chevron-right',
                    text     : QUILocale.get(lg, 'restore.panel.button.next')
                });
            }

            if (index === 0) {
                PreviousButton.disable();
            } else {
                PreviousButton.enable();
            }

            this.activeStep = index;
        },


        /**
         * Shows the next step. Returns if the next step was shown.
         *
         * @return boolean - Was the next step shown?
         */
        showNextStep: function () {
            this.getButton('next').disable();
            this.getButton('previous').enable();

            if (this.getSteps()[this.activeStep].id === "restore-key") {
                this.submit();
                return true;
            }

            if (this.activeStep < this.getSteps().length - 1) {
                this.showStep(this.activeStep + 1);
                return true;
            }

            return false;
        },


        /**
         * Shows the previous step. Returns if the previous step was shown.
         *
         * @return boolean - Was the previous step shown?
         */
        showPreviousStep: function () {
            this.getButton('next').enable();
            this.getButton('previous').disable();

            if (this.activeStep > 0) {
                this.showStep(this.activeStep - 1);
                return true;
            }
            return false;
        },


        /**
         * Returns all step-elements
         *
         * @return {HTMLCollectionOf<Element>}
         */
        getSteps: function () {
            return this.getElm().getElementsByClassName('step');
        },


        /**
         * Returns all step-indicator-elements
         *
         * @return {NodeListOf<Element> | HTMLCollectionOf<Element> | *}
         */
        getStepIndicators: function () {
            return this.getElm().getElementsByClassName('step-indicator');
        },


        /**
         * Returns a promise resolving with a boolean telling if the system-restore is currently requested or not
         *
         *
         * @return Promise
         */
        isRestoreRequested: function () {
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_isRestoreRequested',
                    function (result) {
                        resolve(result);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },


        /**
         * Aborts the restore process.
         * Returns a promise resolving if the abortion was successful.
         * Rejects if an errors occurs.
         *
         * @return Promise
         */
        abortRestore: function () {
            return new Promise(function (resolve, reject) {
                QUIAjax.post(
                    'package_sequry_passdora_ajax_abortRestore',
                    function (result) {
                        resolve(result);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },


        /**
         * Fired when clicked on the abort system-restore button
         */
        abortRestoreClick: function () {
            var self = this;
            this.abortRestore().then(function (isAborted) {
                if (isAborted) {
                    self.close();
                    QUI.getMessageHandler().then(function (MessageHandler) {
                        MessageHandler.addSuccess(
                            QUILocale.get(lg, 'restore.abort.success')
                        );
                    });
                } else {
                    QUI.getMessageHandler().then(function (MessageHandler) {
                        MessageHandler.addError(
                            QUILocale.get(lg, 'restore.abort.error'),
                            self.getButton('abort').getElm()
                        );
                    });
                }
            });
        }
    });
});