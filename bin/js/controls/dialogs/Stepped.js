/**
 * Displays a dialog with multiple steps which the user can navigate through
 *
 * @module package/sequry/passdora/bin/js/controls/Restore/Dialog
 * @author www.pcsg.de (Jan Wennrich)
 *
 * @event onShowStep
 * @event onShowNextStep
 * @event onShowPreviousStep
 *
 */
define('package/sequry/passdora/bin/js/controls/dialogs/Stepped', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'qui/controls/buttons/Button',
    'controls/upload/Form',
    'Ajax',
    'Locale',
    'Mustache',
    'text!package/sequry/passdora/bin/js/controls/dialogs/Stepped.html',
    'css!package/sequry/passdora/bin/js/controls/dialogs/Stepped.css'

], function (QUI, QUIPopup, QUIButton, UploadForm, QUIAjax, QUILocale, Mustache, template) {
    "use strict";

    var lg = 'sequry/passdora';

    return new Class({
        Extends: QUIPopup,
        Type   : 'package/sequry/passdora/bin/js/controls/Dialog/Stepped',

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

        // The currently active step
        activeStep: 0,

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onOpen : this.onPopupOpen,
                onClose: this.onClose
            });
        },


        /**
         * Fired when the dialog is opened.
         * Constructs all the controls and elements.
         *
         * @param Win
         */
        onPopupOpen: function (Win) {
            var self = this;
            var Content = Win.getContent();

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

            self.addButton(NextButton);
            self.addButton(PreviousButton);

            this.disablePreviousButton();

            Content.set({
                html: Mustache.render(template)
            });

            if (this.getAttribute('hideStepIndicators')) {
                this.hideStepIndicators();
            }
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
         * Disables this control.
         * Note that button states are discarded.
         */
        disable: function () {
            this.disableNextButton();
            this.disablePreviousButton();
            this.getElm().getElementById('stepped-dialog').addClass('disabled');
        },


        /**
         * Enables this control.
         * Note that button states are discarded.
         */
        enable: function () {
            this.showStep(this.activeStep);
            this.getElm().getElementById('stepped-dialog').removeClass('disabled');
        },


        /**
         * Adds a given Step-Element to the view
         *
         * @param {Element} Step - Step-Element created via createStepElement()
         */
        addStep: function (Step) {
            this.getElm().getElementById('steps').appendChild(Step);
            this.addStepIndicator();

            var steps = this.getSteps();

            // When first step is added, show it
            if (steps.length === 1) {
                this.showStep(0);
            }

            if (steps.length > 1) {
                this.enableNextButton();
            }
        },


        /**
         * Removes the step with the given index.
         *
         * @param {number} index
         */
        removeStep: function (index) {
            var steps = this.getSteps();
            steps[index].destroy();
            this.getStepIndicators()[0].destroy();

            if (steps.length === 1 || this.activeStep === index - 1) {
                this.disableNextButton();
            }
        },


        /**
         * Creates a Step-Element to use with addStep()
         *
         * @param {string} html - The content of the step
         *
         * @return {Element}
         */
        createStepElement: function (html) {
            return new Element('div', {
                'class': 'step',
                'html' : html
            });
        },


        /**
         * Shows the step with the given index
         *
         * @param index
         */
        showStep: function (index) {
            var steps = this.getSteps();
            var stepIndicators = this.getStepIndicators();

            steps[this.activeStep].style.display = 'none';
            steps[index].style.display = 'block';

            stepIndicators[this.activeStep].removeClass('active');
            stepIndicators[index].addClass('active');

            this.enablePreviousButton();
            if (index === 0) {
                this.disablePreviousButton();
            }

            this.enableNextButton();
            if (index === steps.length - 1) {
                this.disableNextButton();
            }

            this.activeStep = index;

            this.fireEvent('showStep', [steps[index]]);
        },


        /**
         * Returns the "next"-button
         *
         * @returns {Boolean|Object} - qui/controls/buttons/Button
         */
        getNextButton: function () {
            return this.getButton('next');
        },


        /**
         * Returns the "previous"-button
         *
         * @returns {Boolean|Object} - qui/controls/buttons/Button
         */
        getPreviousButton: function () {
            return this.getButton('previous');
        },


        /**
         * Shows the next step. Returns if the next step was shown.
         *
         * @return boolean - Was the next step shown?
         */
        showNextStep: function () {
            var steps = this.getSteps();
            if (this.activeStep < steps.length - 1) {
                this.showStep(this.activeStep + 1);
                this.fireEvent('showNextStep', [steps[this.activeStep]]);
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
            if (this.activeStep > 0) {
                this.showStep(this.activeStep - 1);
                this.fireEvent('showPreviousStep', [this.getSteps()[this.activeStep]]);
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
         * Adds a new step-indicator dot
         */
        addStepIndicator: function () {
            var Indicator = new Element('i', {
                'class': 'step-indicator fa fa-circle'
            });
            this.getElm().getElementById('step-indicators').appendChild(Indicator);
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
         * Shows the step indicator dots
         */
        showStepIndicators: function () {
            this.getElm().getElementById('step-indicators').show();
        },


        /**
         * Hides the step indicator dots
         */
        hideStepIndicators: function () {
            this.getElm().getElementById('step-indicators').hide();
        },


        /**
         * Enables the "next"-button
         */
        enableNextButton: function () {
            this.getNextButton().enable();
        },


        /**
         * Disables the "next"-button
         */
        disableNextButton: function () {
            this.getNextButton().disable();
        },


        /**
         * Enables the "previous"-button
         */
        enablePreviousButton: function () {
            this.getPreviousButton().enable();
        },


        /**
         * Disables the "previous"-button
         */
        disablePreviousButton: function () {
            this.getPreviousButton().disable();
        }
    });
});