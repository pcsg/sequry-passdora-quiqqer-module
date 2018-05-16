/**
 * Displays a panel which shows all backups
 *
 * @module package/sequry/passdora/bin/js/controls/panels/Backups
 * @author www.pcsg.de (Jan Wennrich)
 *
 */
define('package/sequry/passdora/bin/js/controls/panels/Backups', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Button',
    'qui/controls/windows/Confirm',
    'controls/grid/Grid',
    'Locale',
    'Ajax'

], function (QUI, QUIPanel, QUIButton, QUIConfirm, Grid, QUILocale, QUIAjax) {
    "use strict";

    var lg = 'sequry/passdora';

    return new Class({
        Extends: QUIPanel,
        Type   : 'package/sequry/passdora/bin/js/controls/panels/Backups',

        Binds: [
            '$onButtonDeleteClick',
            '$onButtonDownloadClick',
            '$onCreate',
            '$onResize',
            'deleteBackups',
            'downloadBackups',
            'getBackups',
            'initialize',
            'loadBackupsIntoGrid'
        ],

        options: {
            title: QUILocale.get(lg, 'backups.panel.title'),
            icon : 'fa fa-hdd-o'
        },

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onCreate: this.$onCreate,
                onResize: this.$onResize
            });
        },


        /**
         * Fired when the dialog is opened.
         * Constructs all the controls and elements.
         *
         * @param Win
         */
        $onCreate: function (Win) {
            var Content = Win.getContent();

            Content.style.padding = 0;

            this.addButton({
                name     : 'download',
                text     : QUILocale.get(lg, 'backups.panel.button.download'),
                textimage: 'fa fa-cloud-download',
                disabled : true,
                events   : {
                    onClick: this.$onButtonDownloadClick
                }
            });

            this.addButton({
                name     : 'delete',
                textimage: 'fa fa-trash',
                disabled : true,
                events   : {
                    onClick: this.$onButtonDeleteClick
                },
                styles: {
                    float: 'right'
                }
            });

            // creates grid
            this.$Grid = new Grid(Content, {
                columnModel      : [{
                    dataIndex: 'timestamp',
                    dataType : 'integer',
                    hidden   : true
                }, {
                    header   : QUILocale.get('sequry/passdora', 'backups.panel.grid.column.date_formatted'),
                    dataIndex: 'date_formatted',
                    dataType : 'string',
                    width    : 150
                }, {
                    header   : QUILocale.get('sequry/passdora', 'backups.panel.grid.column.filename'),
                    dataIndex: 'filename',
                    dataType : 'string',
                    width    : 200
                }],
                multipleSelection: true,
                pagination       : true,
                showHeader       : true,
                sortBy           : 'ASC',
                sortOn           : 'timestamp'
            });

            this.$Grid.addEvents({
                onRefresh: this.loadBackupsIntoGrid,

                // On double click opens the calendar
                onDblClick: function (data) {
                    var rowData = this.$Grid.getDataByRow(data.row);
                    this.downloadBackups([rowData.filename]);
                }.bind(this),

                // On single click select calendar and (de-)activate buttons
                onClick: function (data) {
                    if (this.$Grid.getSelectedIndices().length > 0) {
                        this.getButtons('download').enable();
                        this.getButtons('delete').enable();
                    }
                }.bind(this)
            });

            this.loadBackupsIntoGrid().then(function () {
                // Sort by timestamps
                this.$Grid.sort(0, 'ASC');
            }.bind(this));
        },


        /**
         * Requests names of all backup files from the server and loads them in the grid.
         */
        loadBackupsIntoGrid: function () {
            var self = this;

            return new Promise(function (resolve) {
                self.getBackups().then(function (backups) {
                    if (!self.$Grid) {
                        return;
                    }

                    self.$Grid.setData({
                        data: backups
                    });

                    resolve();
                });
            });
        },


        /**
         * Returns a promise which resolves with an array of the filenames of all backup files.
         *
         * @return {Promise}
         */
        getBackups: function () {
            return new Promise(function (resolve, reject) {
                QUIAjax.get('package_sequry_passdora_ajax_backup_getBackups', function (result) {
                    resolve(result);
                }, {
                    'package': 'sequry/passdora',
                    onError  : reject
                });
            });
        },

        /**
         * Called when the panel is resized.
         */
        $onResize: function () {
            if (!this.$Grid) {
                return;
            }

            var size = this.getContent().getSize();

            this.$Grid.setHeight(size.y);
            this.$Grid.setWidth(size.x);
        },


        /**
         * Called when the download button is clicked.
         */
        $onButtonDownloadClick: function () {
            if (!this.$Grid) {
                return;
            }

            var data = this.$Grid.getSelectedData();

            if (!data.length || data.length < 1) {
                return;
            }

            data = data.map(function (value) {
                return value.filename;
            });

            this.downloadBackups(data);
        },


        /**
         * Downloads the backups with the given filenames.
         *
         * @param {string[]} backups
         */
        downloadBackups: function (backups) {
            backups.forEach(function (backup) {
                var downloadFile = URL_OPT_DIR + 'sequry/passdora/bin/downloadBackup.php?backup=' + backup,
                    iframeId     = Math.floor(Date.now() / 1000);

                new Element('iframe', {
                    id             : 'download-iframe-' + iframeId,
                    src            : downloadFile,
                    styles         : {
                        left    : -1000,
                        position: 'absolute',
                        top     : -1000,
                        display : 'none'
                    },
                    'data-iframeid': iframeId
                }).inject(document.body);
            });
        },


        /**
         * Called when the delete button is clicked.
         */
        $onButtonDeleteClick: function () {
            if (!this.$Grid) {
                return;
            }

            var data = this.$Grid.getSelectedData();

            if (!data.length || data.length < 1) {
                return;
            }

            data = data.map(function (value) {
                return value.filename;
            });

            this.deleteBackups(data).then(function () {
                this.$Grid.refresh();
            }.bind(this));
        },


        deleteBackups: function (backups) {
            return new Promise(function (resolve, reject) {
                new QUIConfirm({
                    icon       : 'fa fa-trash-o',
                    texticon   : 'fa fa-trash-o',
                    title      : QUILocale.get(lg, 'backups.panel.delete.confirm.title'),
                    text       : QUILocale.get(lg, 'backups.panel.delete.confirm.text'),
                    information: QUILocale.get(lg, 'backups.panel.delete.confirm.information', {
                        ids: backups.join(', ')
                    }),
                    events     : {
                        onSubmit: function (Win)
                        {
                            Win.Loader.show();
                            QUIAjax.get('package_sequry_passdora_ajax_backup_delete', function (result) {
                                Win.close();
                                resolve(result);
                            }, {
                                'package': 'sequry/passdora',
                                onError  : reject,
                                backups  : JSON.encode(backups)
                            });
                        }
                    }
                }).open();
            });
        }
    });
});