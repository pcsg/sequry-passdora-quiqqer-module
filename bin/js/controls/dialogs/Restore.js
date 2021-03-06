/**
 * A dialog used to upload system-restore-files
 *
 * @module package/sequry/passdora/bin/js/controls/dialogs/Restore
 * @author www.pcsg.de (Jan Wennrich)
 *
 */
define('package/sequry/passdora/bin/js/controls/dialogs/Restore', [

    'qui/QUI',
    'controls/upload/Form',
    'package/sequry/passdora/bin/js/controls/dialogs/Stepped',
    'package/sequry/passdora/bin/js/controls/inputs/RestoreKey',
    'Ajax',
    'Locale',
    'Mustache',
    'text!package/sequry/passdora/bin/js/controls/dialogs/restore-templates/steps/finish.html',
    'text!package/sequry/passdora/bin/js/controls/dialogs/restore-templates/steps/key.html',
    'text!package/sequry/passdora/bin/js/controls/dialogs/restore-templates/steps/upload.html',
    'css!package/sequry/passdora/bin/js/controls/dialogs/Restore.css'

], function (QUI, UploadForm, SteppedDialog, RestoreKeyInput, QUIAjax, QUILocale, Mustache, templateFinish, templateKey, templateUpload) {
    "use strict";

    var lg = 'sequry/passdora';

    return new Class({
        Extends: SteppedDialog,
        Type   : 'package/sequry/passdora/bin/js/controls/dialogs/Restore',

        Binds: [
            'onOpen',
            'onClose',
            'onUploadFileAdded',
            'onUploadFileRemoved',
            'onUploadComplete',
            'onShowStep',
            'onShowNextStep',
            'onShowPrevious',
            'disable',
            'enable',
            'abortRestore',
            'abortRestoreClick',
            'buildUploadStep',
            'buildKeyStep',
            'buildFinishStep'
        ],

        options: {
            title: QUILocale.get(lg, 'restore.panel.title'),
            icon : 'fa fa-undo'
        },

        Form: UploadForm,

        RestoreKey: RestoreKeyInput,

        isRestoreRequested: false,

        initialize: function (options) {
            this.parent(options);

            this._isRestoreRequested().then(function (isRestoreRequested) {
                this.isRestoreRequested = isRestoreRequested;
            }.bind(this));

            this.setAttributes({
                'icon'           : 'fa fa-undo',
                'autoclose'      : false,
                'maxHeight'      : 400,
                'closeButtonText': QUILocale.get(lg, 'restore.panel.button.abort')
            });

            this.addEvents({
                onOpen            : this.onOpen,
                onClose           : this.onClose,
                onShowStep        : this.onShowStep,
                onShowNextStep    : this.onShowNextStep,
                onShowPreviousStep: this.onShowPreviousStep
            });
        },


        /**
         * Fired when the dialog is opened.
         * Constructs all the controls and elements.
         *
         * @param Win
         */
        onOpen: function (Win) {
            var CloseButton = this.getCloseButton();

            if (!this.isRestoreRequested) {
                CloseButton.hide();
                this.addStep(this.buildUploadStep());
                this.addStep(this.buildKeyStep());
            }

            this.addStep(this.buildFinishStep(this.isRestoreRequested));

            this.disableNextButton();

            if (this.isRestoreRequested) {
                this.getNextButton().hide();
                this.getPreviousButton().hide();

                this.hideStepIndicators();

                CloseButton.addEventListener('click', this.abortRestoreClick);
                CloseButton.style.width = 'initial';
            }
        },


        /**
         * Called when this dialog is closed.
         * Destroys this control to reset all variables and controls
         */
        onClose: function () {
            // Destroy the form to reset all variables and controls
            this.destroy();
        },


        /**
         * Called when a next step is shown
         *
         * @param Step - the previous step that is now shown
         */
        onShowNextStep: function (Step) {
            this.disableNextButton();
        },


        /**
         * Called when a previous step is shown
         *
         * @param Step - the next step that is now shown
         */
        onShowPreviousStep: function (Step) {
            this.enableNextButton();
        },


        /**
         * Called when any step is shown
         *
         * @param Step - the step that is now shown
         */
        onShowStep: function (Step) {
            if (!this.isRestoreRequested) {
                this.resetButtons();

                var NextButton = this.getNextButton();
                if (Step.id === 'key') {
                    NextButton.setAttributes({
                        textimage: 'fa fa-paper-plane',
                        text     : QUILocale.get(lg, 'restore.panel.button.submit')
                    });
                } else {
                    this.resetButtons();
                }

                if (Step.id === 'finish') {
                    this.submit();
                }
            }
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
         * Builds and returns the file-upload step
         *
         * @return {Element}
         */
        buildUploadStep: function () {
            var stepUploadHtml = Mustache.render(templateUpload, {
                    title      : QUILocale.get(lg, 'restore.panel.file.title'),
                    description: QUILocale.get(lg, 'restore.panel.file.description')
                }
            );
            var StepUpload = this.createStepElement(stepUploadHtml, 'upload');

            this.Form = new UploadForm({maxuploads: 1});

            this.Form.setParam('onfinish', 'package_sequry_passdora_ajax_upload');

            this.Form.addEvents({
                onComplete    : this.onUploadComplete,
                onAdd         : this.onUploadFileAdded,
                onInputDestroy: this.onUploadFileRemoved
            });

            this.Form.inject(StepUpload);

            return StepUpload;
        },


        /**
         * Builds and returns the restore-key-input step
         *
         * @return {Element}
         */
        buildKeyStep: function () {
            var stepKeyHtml = Mustache.render(templateKey, {
                    title      : QUILocale.get(lg, 'restore.panel.key.title'),
                    description: QUILocale.get(lg, 'restore.panel.key.description')
                }
            );
            var StepKey = this.createStepElement(stepKeyHtml, 'key');

            this.RestoreKey = new RestoreKeyInput();

            this.RestoreKey.addEvent('onInputFull', function () {
                this.enableNextButton();
            }.bind(this));

            this.RestoreKey.addEvent('onInput', function () {
                this.disableNextButton();
            }.bind(this));

            this.RestoreKey.inject(StepKey);

            return StepKey;
        },


        /**
         * Builds and returns the finish step
         *
         * @return {Element}
         */
        buildFinishStep: function (isRestoreRequested) {
            var stepFinishHtml = Mustache.render(templateFinish, {
                    title      : QUILocale.get(lg, 'restore.panel.finish.title'),
                    description: QUILocale.get(lg, 'restore.panel.finish.description'),
                    isRestoreRequested: isRestoreRequested,
                    abortRestore: QUILocale.get(lg, 'restore.panel.finish.abortRestore')
                }
            );
            return this.createStepElement(stepFinishHtml, 'finish');
        },


        /**
         * Fired when a file is added to the upload form.
         * Enables the next-button.
         *
         * @param UploadForm
         * @param File
         */
        onUploadFileAdded: function (UploadForm, File) {
            // Check if pgp-encrypted file
            if (File.type !== "application/pgp-encrypted") {
                QUI.getMessageHandler().then(function (MH) {
                    MH.addError(
                        QUILocale.get(lg, 'error.file.type', {filetype: '.gpg'}),
                        this.getNextButton().getElm()
                    );
                }.bind(this));
                return;
            }

            this.enableNextButton();
        },


        /**
         * Fired when a file is removed from the upload form.
         * Disables the next-button.
         */
        onUploadFileRemoved: function () {
            this.disableNextButton();
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
                    if (result.error === true) {
                        self.disableNextButton();
                        self.showPreviousStep();
//                        self.enablePreviousButton();
                        QUI.getMessageHandler().then(function (MH) {
                            MH.addError(
                                result.message,
                                self.getNextButton().getElm()
                            );
                        });
                    }
                }, {
                    'package'   : 'sequry/passdora',
                    'restoreKey': self.RestoreKey.getInput()
                }
            );
        },


        /**
         * Returns a promise resolving with a boolean telling if the system-restore is currently requested or not
         *
         *
         * @return Promise
         */
        _isRestoreRequested: function () {
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