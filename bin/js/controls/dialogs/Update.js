/**
 * Displays a dialog to upload system-update-files
 *
 * @module package/sequry/passdora/bin/js/controls/dialogs/Update
 * @author www.pcsg.de (Jan Wennrich)
 *
 */
define('package/sequry/passdora/bin/js/controls/dialogs/Update', [

    'qui/QUI',
    'controls/upload/Form',
    'package/sequry/passdora/bin/js/controls/dialogs/Stepped',
    'Ajax',
    'Locale',
    'Mustache',
    'text!package/sequry/passdora/bin/js/controls/dialogs/update-templates/steps/finish.html',
    'text!package/sequry/passdora/bin/js/controls/dialogs/update-templates/steps/upload.html',
    'css!package/sequry/passdora/bin/js/controls/dialogs/Update.css'

], function (QUI, UploadForm, SteppedDialog, QUIAjax, QUILocale, Mustache, templateFinish, templateUpload) {
    "use strict";

    var lg = 'sequry/passdora';

    return new Class({
        Extends: SteppedDialog,
        Type   : 'package/sequry/passdora/bin/js/controls/dialogs/Update',

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
            'buildFinishStep',
            'abortUpdateClick',
            'abortUpdate'
        ],

        options: {
            title: QUILocale.get(lg, 'update.panel.title'),
            icon : 'fa fa-cloud-upload'
        },

        Form: UploadForm,

        isUpdateRequested: undefined,

        initialize: function (options) {
            this.parent(options);

            this.setAttributes({
                'icon'       : 'fa fa-cloud-upload',
                'autoclose'  : false,
                'maxHeight'  : 400,
                'closeButtonText': QUILocale.get(lg, 'update.panel.button.abort')
            });

            this.addEvents({
                onOpen            : this.onOpen,
                onClose           : this.onClose,
                onShowStep        : this.onShowStep,
                onShowNextStep    : this.onShowNextStep,
                onShowPreviousStep: this.onShowPreviousStep
            });

            this._isUpdateRequested().then(function (isUpdateRequested) {
                this.isUpdateRequested = isUpdateRequested;
            }.bind(this));
        },


        /**
         * Fired when the dialog is opened.
         * Constructs all the controls and elements.
         *
         * @param Win
         */
        onOpen: function (Win) {
            var CloseButton = this.getCloseButton();

            if (!this.isUpdateRequested) {
                CloseButton.hide();
                this.addStep(this.buildUploadStep());
            }

            this.addStep(this.buildFinishStep());

            if (this.isUpdateRequested) {
                this.getNextButton().hide();
                this.getPreviousButton().hide();

                this.hideStepIndicators();

                CloseButton.addEventListener('click', this.abortUpdateClick);
                CloseButton.style.width = 'initial';
            }

            this.disableNextButton();
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
         * Called when the next step is shown
         *
         * @param Step
         */
        onShowNextStep: function (Step) {
            this.disableNextButton();
        },


        /**
         * Called when the previous step is shown
         *
         * @param Step
         */
        onShowPreviousStep: function (Step) {
            this.enableNextButton();
        },


        /**
         * Called when any step is shown
         *
         * @param Step
         */
        onShowStep: function (Step) {
            if (!this.isUpdateRequested) {
                if (Step.id === 'upload') {
                    this.getNextButton().setAttributes({
                        textimage: 'fa fa-paper-plane',
                        text     : QUILocale.get(lg, 'update.panel.button.submit')
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
            this.disablePreviousButton();
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
                    title         : QUILocale.get(lg, 'update.panel.file.title'),
                    description   : QUILocale.get(lg, 'update.panel.file.description'),
                    unknownSources: QUILocale.get(lg, 'update.panel.file.trustUnknownSources')
                }
            );
            var StepUpload = this.createStepElement(stepUploadHtml, 'upload');

            this.Form = new UploadForm({
                maxuploads: 1
            });

            this.Form.setAttribute('accept', "application/pgp-encrypted");

            this.Form.setParam('onfinish', 'package_sequry_passdora_ajax_update_uploadFile');

            this.Form.addEvents({
                onComplete    : this.onUploadComplete,
                onAdd         : this.onUploadFileAdded,
                onInputDestroy: this.onUploadFileRemoved
            });

            this.Form.inject(StepUpload.getElementById('update-upload-form'));

            return StepUpload;
        },


        /**
         * Builds and returns the finish step
         *
         * @return {Element}
         */
        buildFinishStep: function () {
            var stepFinishHtml = Mustache.render(templateFinish, {
                    title      : QUILocale.get(lg, 'update.panel.finish.title'),
                    description: QUILocale.get(lg, 'update.panel.finish.description'),
                    isUpdateRequested: this.isUpdateRequested,
                    abortUpdate: QUILocale.get(lg, 'update.panel.finish.abortUpdate')
                }
            );
            return this.createStepElement(stepFinishHtml, 'finish');
        },


        /**
         * Called when a file is added to the upload form.
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
         * Called when a file is removed from the upload form.
         * Disables the next-button.
         */
        onUploadFileRemoved: function () {
            this.disableNextButton();
        },


        /**
         * Called when the file-upload is complete.
         */
        onUploadComplete: function () {
            var self = this;
            var trustUnknownSources = self.getElm().getElement('#trust-unknown-sources').checked ? 1 : 0;

            QUIAjax.post(
                'package_sequry_passdora_ajax_update_processFile',
                function (result) {
                    self.Loader.hide();
                    if (result.error === true) {
                        self.disableNextButton();
                        self.showPreviousStep();
                        QUI.getMessageHandler().then(function (MH) {
                            MH.addError(
                                result.message,
                                self.getNextButton().getElm()
                            );
                        });
                    }
                }, {
                    'package'            : 'sequry/passdora',
                    'trustUnknownSources': trustUnknownSources
                }
            );
        },


        /**
         * Aborts the update process.
         * Returns a promise resolving if the abortion was successful.
         * Rejects if an errors occurs.
         *
         * @return Promise
         */
        abortUpdate: function () {
            return new Promise(function (resolve, reject) {
                QUIAjax.post(
                    'package_sequry_passdora_ajax_update_abort',
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
        abortUpdateClick: function () {
            var self = this;
            this.abortUpdate().then(function (isAborted) {
                if (isAborted) {
                    self.close();
                    QUI.getMessageHandler().then(function (MessageHandler) {
                        MessageHandler.addSuccess(
                            QUILocale.get(lg, 'update.abort.success')
                        );
                    });
                } else {
                    QUI.getMessageHandler().then(function (MessageHandler) {
                        MessageHandler.addError(
                            QUILocale.get(lg, 'update.abort.error'),
                            self.getButton('abort').getElm()
                        );
                    });
                }
            });
        },


        /**
         * Returns a promise resolving with a boolean telling if the system-update is currently requested or not
         *
         * @return Promise
         */
        _isUpdateRequested: function () {
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_update_isRequested',
                    function (result) {
                        resolve(result);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        }
    });
});