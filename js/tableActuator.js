var controller;
var TableActuator = (function() {
    'use strict';

    function TableActuator(tableData, container) {
        this.data = localStorage.getItem('tableState') ?
            JSON.parse(localStorage.getItem('tableState')) : tableData;
        this.container = document.getElementsByClassName(container)[0];
        this.headers = [];
        this.sortMap = {};
        this.init();
    }

    TableActuator.prototype = {

        // prototype functions

        //entry point of the app
        init: function() {
            if(!localStorage.getItem('tableState')){
                localStorage.setItem('masterState', JSON.stringify(this.data));
            }
            localStorage.setItem('tableState', JSON.stringify(this.data));
            this.clearContainer();
            this.createTable();
        },
        //clears the table container, by deleting all child elements within it
        clearContainer: function() {
            var $this = this;
            this.container.innerHTML = '';
        },

        /**
         * @method createTable
         * render the grid dynamically based on json data
         */
        createTable: function() {
            var $this = this;
            this.clearContainer();

            var innerContainer = document.createElement('div');
            innerContainer.className = 'inner-container';

            var tableHeaderContainer = document.createElement('div');
            tableHeaderContainer.className = 'table-header';

            var table = document.createElement('div');
            table.className = 'table fixed_headers';

            var tableHeader = document.createElement('div');
            tableHeader.className = 'divTable';
            tableHeader.id = 'headertable';

            var headerBody = document.createElement('div');
            headerBody.className = 'divTableBody';

            var rowHeader = document.createElement('div');
            rowHeader.className = 'divTableRow';

            $this.headers = Object.keys($this.data[0]);

            //dynamically create headers from the key names of an item in the data-set
            for (var header = 0; header < $this.headers.length; header++) {
                var currentIndex = header;
                var headerCell = document.createElement('div');
                var buttonSpan = document.createElement('span');
                var headerSpan = document.createElement('span');
                headerCell.className = 'divTableCell header-cell col' +  ++currentIndex;
                buttonSpan.className = 'headerContent';
                var currentHeader = $this.headers[header];

                //register events for column delete and sorting
                $this.registerEvents(currentHeader, buttonSpan, headerSpan);
                headerSpan.appendChild(document.createTextNode($this.headers[header].toUpperCase()));
                headerCell.appendChild(headerSpan);
                headerCell.appendChild(buttonSpan);
                rowHeader.appendChild(headerCell);
            }

            //append the header to the parent div
            headerBody.appendChild(rowHeader);
            tableHeader.appendChild(headerBody);
            tableHeaderContainer.appendChild(tableHeader);
            innerContainer.appendChild(tableHeaderContainer);


            var tblBodyContainer = document.createElement('div');
            tblBodyContainer.className = 'table-body';


            var tblBody = document.createElement('div');
            tblBody.className = 'divTable';
            tblBody.id = 'bodytable';

            //creating table body contents
            for (var rows = 0; rows < $this.data.length; rows++) {
                // creates a table row
                var row = document.createElement('div');
                row.className = 'divTableRow';
                var tdIndex = 0
                //iterate through data-set values and populate the text node
                for (var key in $this.data[rows]) {
                    var rowCell = document.createElement('div');
                    rowCell.className = 'divTableCell body-cell col' + ++tdIndex;
                    var newSpan = document.createElement('span');
                    newSpan.className = key + '_' + rows
                    var rowText = document.createTextNode($this.data[rows][key]);
                    newSpan.appendChild(rowText);
                    newSpan.setAttribute('contenteditable', 'true');
                    newSpan.onblur = function(event) {
                        $this.updateJSON(event);
                    };
                    rowCell.appendChild(newSpan);
                    row.appendChild(rowCell);
                }
                // add the row to the end of the table body
                tblBody.appendChild(row);
            }

            tblBodyContainer.appendChild(tblBody);
            innerContainer.appendChild(tblBodyContainer)
            this.container.appendChild(innerContainer);
            this.adjustScrollOffset();
        },

        /**
         * @method adjustScrollOffset
         * Register Scroll Event and adjust the offset
         */
        adjustScrollOffset: function(currentHeader, buttonSpan, headerSpan) {
            $('.table-body').scroll(function (){
                $('.table-header').offset({ left: -1 * $('.table-body').scrollLeft() + 178});
            });
        },

        /**
         * @method registerEvents
         * register events for sorting and column delete
         */
        registerEvents: function(currentHeader, buttonSpan, headerSpan) {
            var $this = this;
            //adding events in loops for the header, using closures here.
            buttonSpan.onclick = (function(currentHeader) {
                return function() {
                    $this.removeColumnName(currentHeader);
                };
            })(currentHeader);
            headerSpan.onclick = (function(currentHeader) {
                return function() {
                    $this.sortColumn(currentHeader);
                };
            })(currentHeader);
        },

        /**
         * @method removeColumnName
         * method to remove column on click of icon
         */
        removeColumnName: function(column) {
            //remove columns except for the last one
            if (Object.keys(this.data[0]).length > 1) {
                this.data.forEach(function(val) {
                    delete val[column];
                });

                localStorage.setItem('tableState', JSON.stringify(this.data));

                //redraw the table with new data-set after removing of column
                this.createTable();
            }
        },

        /**
         * @method sortColumn
         * method to sort column on click of column header
         */
        sortColumn: function(column) {
            //sort the column ascending and descending
            var $this = this;
            this.data.sort(function(a, b) {
                return (a[column] > b[column]) ? 1 : ((b[column] > a[column]) ? -1 : 0) * ($this.sortMap[column] ? -1 : 1);
            });
            $this.sortMap[column] = !$this.sortMap[column];

            //redraw the table with new data-set order
            this.createTable();
        },

        /**
         * @method updateJSON
         * method to update json data on cell edit
         */
        updateJSON: function(event) {

            var keyDetails = event.target.className.split('_');
            this.data[keyDetails[1]][keyDetails[0]] = event.target.textContent;
            localStorage.setItem('tableState', JSON.stringify(this.data));
        },

        /**
         * @method exportCSV
         *
         */
        exportCSV: function(){
            var link;
            if (this.data) {
                link = document.createElement('a');
                link.href = 'data:attachment/csv,' + encodeURIComponent(JSON.stringify(this.data));
                link.target = '_blank';
                link.download = 'Sales_Report.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        },

        /**
         * @method resetToInitialState
         *
         */
        resetToInitialState: function(){
            this.data = JSON.parse(localStorage.getItem('masterState'));
            this.createTable();
        },

    }

    return TableActuator;
})();

document.onreadystatechange = function() {
    if (this.readyState === 'complete') {
        var isLoggedIn = localStorage.getItem('isLoggesIn');
        if(isLoggedIn){
            controller = new TableActuator(data, 'container');
            setTableBody();
            $(window).resize(setTableBody);
        } else {
            window.location = 'login.html';
        }
    };
}

function setTableBody() {
    $('.table-body').height($('.inner-container').height() - $('.table-header').height());
}

//standalone method for row searching the table
// I understand this is a costly operation since we are
// dealing directly with the DOM here, the ideal way would be
// to filter the json based on search and then re-render the grid
// Because of time limitation resorting to this approach
function searchHandler(event) {
    var input = event.target;
    var tableContent = document.querySelectorAll('.table-body .divTableRow');
    Array.prototype.forEach.call(tableContent, function(row) {
        if (input.value.length >= 2) {
            var wholeText = row.textContent.toLowerCase();
            var filterValue = input.value.toLowerCase();
            row.style.display = wholeText.indexOf(filterValue) === -1 ? 'none' : '';
        } else {
            row.style.display = '';
        }
    });
}

function exportCSV() {
    controller.exportCSV();
}

function resetTable() {
    controller.resetToInitialState();
}
