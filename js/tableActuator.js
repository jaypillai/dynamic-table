var TableActuator = (function() {
    "use strict";

    function TableActuator(tableData) {
        this.data = tableData;
        this.container = document.getElementsByClassName('container')[0];
        this.headers = [];
        this.sortMap = {};
        this.init();
    }

    TableActuator.prototype = {

      // prototype functions

        //entry point of the app
        init: function() {
            this.clearContainer();
            this.createTable();
        },
        //clears the table container, by deleting all child elements within it
        clearContainer: function() {
            var $this = this;
            while ($this.container.firstChild) {
                $this.container.removeChild($this.container.firstChild);
            }
        },
        //method to create header and table
        createTable: function() {
            var $this = this;
            this.clearContainer();
            var table = document.createElement("div");
            table.className = "table fixed_headers";

            var tableHeader = document.createElement("div");
            tableHeader.className = "header";

            var rowHeader = document.createElement("div");
            rowHeader.className = "row";
            $this.headers = Object.keys($this.data[0]);
            
            //dynamically create headers from the key names of an item in the data-set
            for (var header = 0; header < $this.headers.length; header++) {
                var headerCell = document.createElement("div");
                var buttonSpan = document.createElement("span");
                var headerSpan = document.createElement("span");
                headerCell.className = "cell";
                buttonSpan.className = "headerContent";
                var currentHeader = $this.headers[header];

                //register events for column delete and sorting
                $this.registerEvents(currentHeader, buttonSpan, headerSpan);
                headerSpan.appendChild(document.createTextNode($this.headers[header].toUpperCase()));
                headerCell.appendChild(headerSpan);
                headerCell.appendChild(buttonSpan);
                rowHeader.appendChild(headerCell);
            }

            //append the header to the parent div
            tableHeader.appendChild(rowHeader);
            table.appendChild(tableHeader);
            var tblBody = document.createElement("div");
            tblBody.className = "table-row";

            //creating table body contents
            for (var rows = 0; rows < $this.data.length; rows++) {
                // creates a table row
                var row = document.createElement("div");
                row.className = "row";

                //iterate through data-set values and populate the text node
                for (var key in $this.data[rows]) {
                    var rowCell = document.createElement("div");
                    rowCell.className = "cell";
                    var newSpan = document.createElement('span');

                    var rowText = document.createTextNode($this.data[rows][key]);
                    newSpan.appendChild(rowText);
                    newSpan.setAttribute('contenteditable', 'true');
                    newSpan.onblur = (function() {
                        return function() {
                            $this.updateJSON();
                        };
                    })();
                    rowCell.appendChild(newSpan);
                    row.appendChild(rowCell);
                }
                // add the row to the end of the table body
                tblBody.appendChild(row);
            }
            table.appendChild(tblBody);
            this.container.appendChild(table);

        },
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
        removeColumnName: function(column) {
            //remove columns except for the last one
            if (Object.keys(this.data[0]).length > 1) {
                this.data.forEach(function(val) {
                    delete val[column];
                });
                //redraw the table with new data-set after removing of column
                this.createTable();
            }
        },
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
        updateJSON: function() {
            //update the data-set values after inline editing
            var $this = this;
            $this.headers = [];
            document.querySelectorAll(".header .cell").forEach(
                function(val) {
                    $this.headers.push(val.textContent);
                });
            //getting updated cell values and re-creating the data-set
            var tableContent = document.querySelectorAll(".table-row .row");
            $this.data = [];
            for (var row = 0; row < tableContent.length; row++) {
                var temp = {};
                tableContent[row].querySelectorAll(".cell").forEach(function(cell, index) {
                    temp[$this.headers[index]] = cell.textContent;
                });
                $this.data.push(temp);
            }
            //redraw the table with inline edited data-set
            $this.createTable();
        }
    }

    return TableActuator;
})();



document.onreadystatechange = function() {
    if (this.readyState === "complete") {
        var controller = new TableActuator(data);
    };
}

//standalone method for row searching the table
function searchHandler(event) {
    var input = event.target;
    var tableContent = document.querySelectorAll(".table-row .row");
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
