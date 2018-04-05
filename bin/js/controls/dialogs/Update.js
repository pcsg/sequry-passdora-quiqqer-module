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
            'buildFinishStep'
        ],

        options: {
            title: QUILocale.get(lg, 'update.panel.title'),
            icon : 'fa fa-cloud-upload'
        },

        Form: UploadForm,

        initialize: function (options) {
            this.parent(options);

            this.setAttributes({
                'icon'       : 'fa fa-cloud-upload',
                'autoclose'  : false,
                'maxHeight'  : 400,
                'closeButton': false
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
            this.addStep(this.buildUploadStep());
            this.addStep(this.buildFinishStep());

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
                    description: QUILocale.get(lg, 'update.panel.finish.description')
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
        }
    });
});