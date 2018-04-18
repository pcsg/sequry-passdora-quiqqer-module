/**
 * Displays a dialog which displays the system status
 *
 * @module package/sequry/passdora/bin/js/controls/dialogs/Status
 * @author www.pcsg.de (Jan Wennrich)
 *
 */
define('package/sequry/passdora/bin/js/controls/dialogs/Status', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Button',
    'Locale',
    'Ajax',

    'css!package/sequry/passdora/bin/js/controls/dialogs/Status.css'

], function (QUI, QUIPanel, QUIButton, QUILocale, QUIAjax) {
    "use strict";

    var lg = 'sequry/passdora';

    return new Class({
        Extends: QUIPanel,
        Type   : 'package/sequry/passdora/bin/js/controls/dialogs/Status',

        Binds: [
            'getCpuBlock',
            'createTable',
            'getDiskBlock',
            'initialize',
            'iterateObject',
            'getLastLoginBlock',
            'getLoadAverageBlock',
            'getMemoryBlock',
            'getNetworkUsageBlock',
            '$onCreate',
            'onCategoryEnter',
            'getServicesBlock',
            'getSwapBlock',
            'getSystemBlock'
        ],

        options: {
            title: QUILocale.get(lg, 'status.panel.title'),
            icon : 'fa fa-heartbeat'
        },

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onCreate       : this.$onCreate,
                onCategoryEnter: this.onCategoryEnter
            });

            this.categories = {
                cpu         : {
                    icon    : 'fa fa-microchip',
                    text    : 'CPU',
                    getBlock: this.getCpuBlock
                },
                disk        : {
                    icon    : 'fa fa-hdd-o',
                    text    : 'Disk',
                    getBlock: this.getDiskBlock
                },
                lastLogin   : {
                    icon    : 'fa fa-sign-in',
                    text    : 'Last Login',
                    getBlock: this.getLastLoginBlock
                },
                memory      : {
                    icon    : 'fa fa-microchip',
                    text    : 'Memory',
                    getBlock: this.getMemoryBlock
                },
                networkUsage: {
                    icon    : 'fa fa-wifi',
                    text    : 'Network Usage',
                    getBlock: this.getNetworkUsageBlock
                },
                services    : {
                    icon    : 'fa fa-cogs',
                    text    : 'Services',
                    getBlock: this.getServicesBlock
                },
                swap        : {
                    icon    : 'fa fa-hdd-o',
                    text    : 'Swap',
                    getBlock: this.getSwapBlock
                },
                system      : {
                    icon    : 'fa fa-server',
                    text    : 'System',
                    getBlock: this.getSystemBlock
                }
            };
        },


        /**
         * Fired when the dialog is opened.
         * Constructs all the controls and elements.
         *
         * @param Win
         */
        $onCreate: function (Win) {
            var Content = Win.getContent();

            this.iterateObject(this.categories, function (key, value) {
                this.addCategory(new QUIButton({
                    icon: value.icon,
                    text: value.text,
                    name: key
                }));
            }.bind(this));

            this.getSystemBlock().then(function(Block) {
                this.setContent(Block.outerHTML);
            }.bind(this));
        },


        onCategoryEnter: function (self, Button) {
            var category = Button.getAttribute('name');

            this.categories[category].getBlock().then(function (Block) {
                this.setContent(Block.outerHTML);
            }.bind(this));
        },


        createTable: function (object, headings) {
            var Table = new Element('table');

            var Head = new Element('thead');
            if (headings) {
                for (var i = 0; i < headings.length; i++) {
                    new Element('th', {
                        html: headings[i]
                    }).inject(Head);
                }

            }
            Head.inject(Table);

            var Body = new Element('tbody');
            this.iterateObject(object, function (key, value) {
                var Row = new Element('tr');

                if (value !== null && typeof value === 'object') {
                    this.iterateObject(value, function (objectKey, objectValue) {
                        new Element('td', {
                            html: objectValue
                        }).inject(Row);
                    });
                } else {
                    new Element('td', {
                        html: QUILocale.get('sequry/passdora', 'status.' + key)
                    }).inject(Row);

                    new Element('td', {
                        html: value
                    }).inject(Row);
                }

                Row.inject(Body);
            }.bind(this));
            Body.inject(Table);

            return Table;
        },


        iterateObject: function (object, func) {
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    func(key, object[key]);
                }
            }
        },


        createBlock: function (id, title, content) {
            var Block = new Element('div', {
                'class': 'status-block',
                id     : id
            });

            var Header = new Element('div', {
                'class': 'status-block-header'
            });

            new Element('h2', {
                html: title
            }).inject(Header);

            var Content = new Element('div', {
                'class': 'status-block-content'
            });

            content.inject(Content);
            Header.inject(Block);
            Content.inject(Block);

            return Block;
        },


        getCpuBlock: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_status_cpu',
                    function (result) {
                        var Table = self.createTable(result);
                        var Block = self.createBlock('cpu', 'CPU', Table);

                        resolve(Block);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },

        getDiskBlock: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_status_disk',
                    function (result) {
                        var Table = self.createTable(result, [
                            QUILocale.get('sequry/passdora','status.total'),
                            QUILocale.get('sequry/passdora','status.used'),
                            QUILocale.get('sequry/passdora','status.free'),
                            QUILocale.get('sequry/passdora','status.percent_used'),
                            QUILocale.get('sequry/passdora','status.mount'),
                            QUILocale.get('sequry/passdora','status.filesystem')
                        ]);
                        var Block = self.createBlock('disks', 'Disk Usage', Table);

                        resolve(Block);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },

        getLastLoginBlock: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_status_lastLogin',
                    function (result) {
                        var Table = self.createTable(result);
                        var Block = self.createBlock('last-login', 'Last Login', Table);

                        resolve(Block);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },

        getLoadAverageBlock: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_status_loadAverage',
                    function (result) {
                        var Table = self.createTable(result);
                        var Block = self.createBlock('load-average', 'Load Average', Table);

                        resolve(Block);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },

        getMemoryBlock: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_status_memory',
                    function (result) {
                        var Table = self.createTable(result);
                        var Block = self.createBlock('memory', 'Memory', Table);

                        resolve(Block);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },

        getNetworkUsageBlock: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_status_networkUsage',
                    function (result) {
                        var Table = self.createTable(result, [
                            QUILocale.get('sequry/passdora','status.interface'),
                            QUILocale.get('sequry/passdora','status.ip'),
                            QUILocale.get('sequry/passdora','status.sent'),
                            QUILocale.get('sequry/passdora','status.received')
                        ]);
                        var Block = self.createBlock('network-usage', 'Network Usage', Table);

                        resolve(Block);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },

        getServicesBlock: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_status_services',
                    function (result) {
                        var Table = self.createTable(result, [
                            QUILocale.get('sequry/passdora','status.id'),
                            QUILocale.get('sequry/passdora','status.name'),
                            QUILocale.get('sequry/passdora','status.active')
                        ]);
                        var Block = self.createBlock('services', 'Services', Table);

                        resolve(Block);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },

        getSwapBlock: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_status_swap',
                    function (result) {
                        var Table = self.createTable(result);
                        var Block = self.createBlock('swap', 'Swap', Table);

                        resolve(Block);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        },

        getSystemBlock: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                QUIAjax.get(
                    'package_sequry_passdora_ajax_status_system',
                    function (result) {
                        var Table = self.createTable(result);
                        var Block = self.createBlock('system', 'System', Table);

                        resolve(Block);
                    }, {
                        'package': 'sequry/passdora',
                        onError  : reject
                    }
                );
            });
        }
    });
});