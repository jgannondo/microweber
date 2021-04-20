(function (){
    mw.require('filemanager.css');
    var FileManager = function (options) {

        var scope = this;

        options = options || {};

        if(!options.url) {
            console.warn('API url is not specified');
        }

        var defaultRequest = function (params, callback) {
            var xhr = new XMLHttpRequest();
            scope.dispatch('beforeRequest', {xhr: xhr, params: params});
            xhr.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    callback.call(scope, JSON.parse(this.responseText), xhr);
                }
            };
            xhr.open("GET", scope.settings.url || '', true);
            xhr.send();
        };

        var defaults = {
            multiselect: true,
            options: true,
            element: null,
            query: {
                order: 'asc',
                orderBy: 'name',
                keyword: '',
                display: 'list'
            },
            requestData: defaultRequest,
            url: null,
            template: 'default',
            height: 'auto',
            contextMenu: [
                { label: 'Rename', action: function (rowObject) {}, match: function (rowObject) { return !!rowObject; } },
                { label: 'Download', action: function (rowObject) {}, match: function (rowObject) { return rowObject.type === 'file'; } },
                { label: 'Copy url', action: function (rowObject) {}, match: function (rowObject) { return !!rowObject; } },
                { label: 'Delete', action: function (rowObject) {}, match: function (rowObject) { return !!rowObject; } },
            ],
            document: document
        };

        var _e = {};
        var _viewType = 'list';

        this.on = function (e, f) { _e[e] ? _e[e].push(f) : (_e[e] = [f]) };
        this.dispatch = function (e, f) { _e[e] ? _e[e].forEach(function (c){ c.call(this, f); }) : ''; };

        this.settings = mw.object.extend({}, defaults, options);

        var table, tableHeader, tableBody;



        var _check = function () {
            return mw.element('<label class="mw-ui-check">' +
                '<input type="checkbox"><span></span>' +
                '</label>');
        };

        var _size = function (item, dc) {
            var bytes = item.size;
            if (typeof bytes === 'undefined' || bytes === null) return '';
            if (bytes === 0) return '0 Bytes';
            var k = 1000,
                dm = dc === undefined ? 2 : dc,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };



        var _image = function (item) {
            if (item.type === 'folder') {
                return '<span class="mw-file-manager-list-item-thumb mw-file-manager-list-item-thumb-folder"></span>';
            } else if (item.thumbnail) {
                return '<span class="mw-file-manager-list-item-thumb mw-file-manager-list-item-thumb-image" style="background-image: url(' + item.thumbnail + ')"></span>';
            } else {
                var ext = item.name.split('.').pop();
                if(!ext) {
                    ext = item.mimeType;
                }
                return '<span class="mw-file-manager-list-item-thumb mw-file-manager-list-item-thumb-file">' + (ext) + '</span>';
            }
        };

        var createOption = function (item, option) {
            if(!option.match(item)) {
                return '';
            }
            var el = mw.element({
                content: option.label
            });
            el.on('click', function (){
                option.action(item);
            }).addClass('mw-file-manager-list-item-options-list-option');
            return el;
        };


        var currentMenu;

        var createOptions = function (item) {
            var options = scope.settings.contextMenu;
            var el = mw.element().addClass('mw-file-manager-list-item-options');
            el.append(mw.element({tag: 'span', content: '...', props: {tooltip:'options'}}).addClass('mw-file-manager-list-item-options-button'));

            el.on('click', function (){
                var all = scope.root.get(0).querySelectorAll('.mw-file-manager-list-item-options.active');
                for(var i = 0; i < all.length; i++ ) {
                    if (all[i] !== this) {
                        all[i].classList.remove('active');
                    }
                }

                var optsHolder = mw.element().addClass('mw-file-manager-list-item-options-list');
                options.forEach(function (options){
                    optsHolder.append(createOption(item, options));
                });
                scope.settings.document.body.append(optsHolder.get(0));
                var off = el.offset();
                optsHolder.css({
                    top: off.top,
                    left: off.left
                });
                el.toggleClass('active');

            });

            if(!this.__bodyOptionsClick) {
                this.__bodyOptionsClick = true;
                var bch = function (e) {
                    var curr = e.target;
                    var clicksOption = false;
                  while (curr && curr !== scope.settings.document.body) {
                      if(curr.classList.contains('mw-file-manager-list-item-options')){
                          clicksOption = true;
                          break;
                      }
                      curr = curr.parentNode;
                  }
                  if(!clicksOption) {
                      var all = scope.root.get(0).querySelectorAll('.mw-file-manager-list-item-options.active');
                      for (var i = 0; i < all.length; i++ ) {
                          if (all[i] !== this) {
                              all[i].classList.remove('active');
                          }
                      }
                  }
                };
                scope.settings.document.body.addEventListener('mousedown', bch , false);
            }
            ;
            return el;
        };


        var setData = function (data) {
            scope._data = data;
        };

        this.updateData = function (data) {
            setData(data);
            this.dispatch('dataUpdated', data);
        };

        this.getData = function () {
            return this._data;
        };

        this.requestData = function () {
            var params = {};
            var cb = function (res) {
                scope.updateData(res);
            };

            var err = function (er) {

            };

            this.settings.requestData(
                params, cb, err
            );
        };


        this.render = function () {

        };

        var userDate = function (date) {
            var dt = new Date(date);
            return dt.toLocaleString();
        };

        this.find = function (item) {
            if (typeof item === 'number') {

            }
        };



        this.singleListView = function (item) {
            var row = mw.element({ tag: 'tr' });
            var cellImage = mw.element({ tag: 'td', content: _image(item)  });
            var cellName = mw.element({ tag: 'td', content: item.name  });
            var cellSize = mw.element({ tag: 'td', content: _size(item) });

            var cellmodified = mw.element({ tag: 'td', content: userDate(item.modified)  });

            if(this.settings.multiselect) {
                var check =  _check();
                check.on('input', function () {

                });
                row.append( mw.element({ tag: 'td', content: check }));
            }

             row
                .append(cellImage)
                .append(cellName)
                .append(cellSize)
                .append(cellmodified);
            if(this.settings.options) {
                var cellOptions = mw.element({ tag: 'td', content: createOptions(item) });
                row.append(cellOptions);
            }


            return row;
        };

        var rows = [];

        var listViewBody = function () {
            rows = [];
            tableBody ? tableBody.remove() : '';
            tableBody =  mw.element({
                tag: 'tbody'
            });
            scope._data.data.forEach(function (item) {
                var row = scope.singleListView(item);
                rows.push({data: item, row: row});
                tableBody.append(row);
            });
            return tableBody;
        };


        this._selected = [];

        var pushUnique = function (obj) {
            if (scope._selected.indexOf(obj) === -1) {
                scope._selected.push(obj);
            }
        };


        var allSelected = function (){
            return scope._selected.length === rows.length;
        };

        this.selectAll = function () {
            if (scope.settings.multiselect) {
                rows.forEach(function (rowItem){
                    var obj = rowItem.data;
                    selectCore(obj);
                    rowItem.row.find('input').prop('checked', true);
                });
                this.dispatch('selectionChange', scope._selected)
            }
        };
        this.selectNone = function () {
            scope._selected = [];
            rows.forEach(function (rowItem){
                rowItem.row.find('input').prop('checked', false);
            });
            this.dispatch('selectionChange', scope._selected)
        };
        this.selectToggle = function () {
            allSelected() ? this.selectNone() : this.selectAll();
        };

        var selectCore = function (obj) {
            if (scope.settings.multiselect) {
                pushUnique(obj);
            } else {
                scope._selected = [obj];
            }
        };

        this.select = function (obj) {
            selectCore(obj);
            var rowItem = rows.find(function (rowItem){
                return rowItem.data === obj;
            });
            if(rowItem) {
                rowItem.row.find('input').prop('checked', true);
            }
            this.dispatch('selectionChange', scope._selected);
        };

        var createListViewHeader = function () {
            var thCheck;
            if (scope.settings.multiselect) {
                var globalcheck = _check();
                globalcheck.on('input', function () {
                    scope.selectToggle();
                });
                thCheck = mw.element({ tag: 'th', content: globalcheck  }).addClass('mw-file-manager-select-all-heading');
            }
            var thImage = mw.element({ tag: 'th', content: ''  });
            var thName = mw.element({ tag: 'th', content: '<span>Name</span>'  }).addClass('mw-file-manager-sortable-table-header');
            var thSize = mw.element({ tag: 'th', content: '<span>Size</span>'  }).addClass('mw-file-manager-sortable-table-header');
            var thModified = mw.element({ tag: 'th', content: '<span>Last modified</span>'  }).addClass('mw-file-manager-sortable-table-header');
            var thOptions = mw.element({ tag: 'th', content: ''  });
            var tr = mw.element({
                tag: 'tr',
                content: [thCheck, thImage, thName, thSize, thModified, thOptions]
            });
            tableHeader =  mw.element({
                tag: 'thead',
                content: tr
            });
            return tableHeader;
        };

        var listView = function () {
            table =  mw.element('<table class="mw-file-manager-listview-table" />');
            table
                .append(createListViewHeader())
                .append(listViewBody());
            return table;
        };

        var gridView = function () {
            var grid =  mw.element('<div />');

            return grid;
        };

        this.view = function (type) {
            if(!type) return _viewType;
            _viewType = type;
            var viewblock;
            if (_viewType === 'list') {
                viewblock = listView();
            } else if (_viewType === 'grid') {
                viewblock = gridView();
            }
            if(viewblock) {
                this.root.empty().append(viewblock);
            }
            this.root.dataset('view', _viewType);
        };

        this.refresh = function () {
            if (_viewType === 'list') {
                listViewBody();
            } else if (_viewType === 'grid') {
                this.listView();
            }
        };

        var createRoot = function (){
            scope.root = mw.element({
                props: {
                    className: 'mw-file-manager-root mw-file-manager-template-' + scope.settings.template
                },
                css: {
                    height: scope.settings.height,
                    minHeight: '260px'
                },
                encapsulate: false
            });

        };

        this.init = function (){
            createRoot();
            this.on('dataUpdated', function (res){
                scope.view(_viewType);
            });
            this.requestData();
            if (this.settings.element) {
                mw.element(this.settings.element).empty().append(this.root);
            }
        };

        this.init();
    };

    mw.FileManager = function (options) {
        return new FileManager(options);
    };
})();
