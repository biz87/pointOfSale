pointsOfSale.grid.Points = function (config) {
    config = config || {};
    if (!config.id) {
        config.id = 'pointsofsale-grid-points';
    }
    Ext.applyIf(config, {
        url: pointsOfSale.config.connector_url,
        fields: this.getFields(config),
        columns: this.getColumns(config),
        tbar: this.getTopBar(config),
        sm: new Ext.grid.CheckboxSelectionModel(),
        baseParams: {
            action: 'mgr/point/getlist'
        },
        listeners: {
            rowDblClick: function (grid, rowIndex, e) {
                var row = grid.store.getAt(rowIndex);
                this.updatePoint(grid, e, row);
            }
        },
        viewConfig: {
            forceFit: true,
            enableRowBody: true,
            autoFill: true,
            showPreview: true,
            scrollOffset: 0,
            getRowClass: function (rec) {
                return !rec.data.active
                    ? 'pointsofsale-grid-row-disabled'
                    : '';
            }
        },
        paging: true,
        remoteSort: true,
        autoHeight: true,
    });
    pointsOfSale.grid.Points.superclass.constructor.call(this, config);

    // Clear selection on grid refresh
    this.store.on('load', function () {
        if (this._getSelectedIds().length) {
            this.getSelectionModel().clearSelections();
        }
    }, this);
};
Ext.extend(pointsOfSale.grid.Points, MODx.grid.Grid, {
    windows: {},

    getMenu: function (grid, rowIndex) {
        var ids = this._getSelectedIds();

        var row = grid.getStore().getAt(rowIndex);
        var menu = pointsOfSale.utils.getMenu(row.data['actions'], this, ids);

        this.addContextMenuItem(menu);
    },

    createPoint: function (btn, e) {
        var w = MODx.load({
            xtype: 'pointsofsale-point-window-create',
            id: Ext.id(),
            listeners: {
                success: {
                    fn: function () {
                        this.refresh();
                    }, scope: this
                }
            }
        });
        w.reset();
        w.setValues({active: true});
        w.show(e.target);
    },

    updatePoint: function (btn, e, row) {
        if (typeof (row) != 'undefined') {
            this.menu.record = row.data;
        } else if (!this.menu.record) {
            return false;
        }
        var id = this.menu.record.id;

        MODx.Ajax.request({
            url: this.config.url,
            params: {
                action: 'mgr/point/get',
                id: id
            },
            listeners: {
                success: {
                    fn: function (r) {
                        var w = MODx.load({
                            xtype: 'pointsofsale-point-window-update',
                            id: Ext.id(),
                            record: r,
                            listeners: {
                                success: {
                                    fn: function () {
                                        this.refresh();
                                    }, scope: this
                                }
                            }
                        });
                        w.reset();
                        w.setValues(r.object);
                        w.show(e.target);
                    }, scope: this
                }
            }
        });
    },

    removePoint: function () {
        var ids = this._getSelectedIds();
        if (!ids.length) {
            return false;
        }
        MODx.msg.confirm({
            title: ids.length > 1
                ? _('pointsofsale_points_remove')
                : _('pointsofsale_point_remove'),
            text: ids.length > 1
                ? _('pointsofsale_points_remove_confirm')
                : _('pointsofsale_point_remove_confirm'),
            url: this.config.url,
            params: {
                action: 'mgr/point/remove',
                ids: Ext.util.JSON.encode(ids),
            },
            listeners: {
                success: {
                    fn: function () {
                        this.refresh();
                    }, scope: this
                }
            }
        });
        return true;
    },

    disablePoint: function () {
        var ids = this._getSelectedIds();
        if (!ids.length) {
            return false;
        }
        MODx.Ajax.request({
            url: this.config.url,
            params: {
                action: 'mgr/point/disable',
                ids: Ext.util.JSON.encode(ids),
            },
            listeners: {
                success: {
                    fn: function () {
                        this.refresh();
                    }, scope: this
                }
            }
        })
    },

    enablePoint: function () {
        var ids = this._getSelectedIds();
        if (!ids.length) {
            return false;
        }
        MODx.Ajax.request({
            url: this.config.url,
            params: {
                action: 'mgr/point/enable',
                ids: Ext.util.JSON.encode(ids),
            },
            listeners: {
                success: {
                    fn: function () {
                        this.refresh();
                    }, scope: this
                }
            }
        })
    },

    getFields: function () {
        return ['id', 'country', 'city', 'retailer', 'active', 'actions'];
    },

    getColumns: function () {
        return [{
            header: _('pointsofsale_point_id'),
            dataIndex: 'id',
            sortable: true,
            width: 70
        }, {
            header: _('pointsofsale_point_country'),
            dataIndex: 'country',
            sortable: true,
            width: 200,
        }, {
            header: _('pointsofsale_point_city'),
            dataIndex: 'city',
            sortable: false,
            width: 250,
        }, {
            header: _('pointsofsale_point_retailer'),
            dataIndex: 'retailer',
            sortable: false,
            width: 250,
        }, {
            header: _('pointsofsale_point_active'),
            dataIndex: 'active',
            renderer: pointsOfSale.utils.renderBoolean,
            sortable: true,
            width: 100,
        }, {
            header: _('pointsofsale_grid_actions'),
            dataIndex: 'actions',
            renderer: pointsOfSale.utils.renderActions,
            sortable: false,
            width: 100,
            id: 'actions'
        }];
    },

    getTopBar: function () {
        return [
            {
                text: '<i class="icon icon-plus"></i>&nbsp;' + _('pointsofsale_point_create'),
                handler: this.createPoint,
                scope: this
            }, {
                xtype: 'pointsofsale-points-excel-upload-form'
                , id: 'pointsofsale-points-excel-upload-form'
            }, '->', {
                xtype: 'pointsofsale-field-search',
                width: 250,
                listeners: {
                    search: {
                        fn: function (field) {
                            this._doSearch(field);
                        }, scope: this
                    },
                    clear: {
                        fn: function (field) {
                            field.setValue('');
                            this._clearSearch();
                        }, scope: this
                    },
                }
            }];
    },

    onClick: function (e) {
        var elem = e.getTarget();
        if (elem.nodeName == 'BUTTON') {
            var row = this.getSelectionModel().getSelected();
            if (typeof (row) != 'undefined') {
                var action = elem.getAttribute('action');
                if (action == 'showMenu') {
                    var ri = this.getStore().find('id', row.id);
                    return this._showMenu(this, ri, e);
                } else if (typeof this[action] === 'function') {
                    this.menu.record = row.data;
                    return this[action](this, e);
                }
            }
        }
        return this.processEvent('click', e);
    },

    _getSelectedIds: function () {
        var ids = [];
        var selected = this.getSelectionModel().getSelections();

        for (var i in selected) {
            if (!selected.hasOwnProperty(i)) {
                continue;
            }
            ids.push(selected[i]['id']);
        }

        return ids;
    },

    _doSearch: function (tf) {
        this.getStore().baseParams.query = tf.getValue();
        this.getBottomToolbar().changePage(1);
    },

    _clearSearch: function () {
        this.getStore().baseParams.query = '';
        this.getBottomToolbar().changePage(1);
    },
});
Ext.reg('pointsofsale-grid-points', pointsOfSale.grid.Points);


pointsOfSale.ExcelUploadForm = function (config) {
    config = config || {};
    Ext.applyIf(config, {
        layout: 'form'
        , url: pointsOfSale.config.connector_url
        , baseParams: {
            action: 'mgr/point/upload'
        }
        , id: 'pointsofsale-points-upload-form'
        , keys: [{
            key: Ext.EventObject.ENTER, shift: true, fn: function () {
                this.submit()
            }, scope: this
        }]
        , items: this.getFields(config)
        , listeners: {
            success: {
                fn: function () {
                    location.reload();
                }, scope: this
            }
        }
    });
    pointsOfSale.ExcelUploadForm.superclass.constructor.call(this, config);
};
Ext.extend(pointsOfSale.ExcelUploadForm, MODx.FormPanel, {
    getFields: function (config) {
        return [{
            layout: 'column'
            ,items: [
                {
                    name: 'file'
                    , xtype: 'modx-combo-browser'
                    , hideFiles: true
                    , source: MODx.config['pointsofsale_source'] || MODx.config.default_media_source
                    , id: 'pointsofsale-points-upload-input'
                    , emptyText: _('pointsofsale_upload_points_of_sale')

                }, {
                    xtype: 'button'
                    , cls: 'primary-button'
                    , text: _('pointsofsale_points_upload_btn')
                    , id: 'pointsofsale-points-upload'
                    , listeners: {
                        click: {
                            fn: function () {
                                this.submit();
                            }, scope: this
                        },
                    }
                }
            ],
        }];
    },
});
Ext.reg('pointsofsale-points-excel-upload-form', pointsOfSale.ExcelUploadForm);