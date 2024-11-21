const apiURL = 'http://localhost:5000/';

document.addEventListener('DOMContentLoaded', function () {
    fetchData()
    .then(data => loadHTMLTable(data['data']));
});

document.querySelector('#cal-index-data').addEventListener('click', function(event) {
    if (event.target.className === 'delete-row-btn') {
        deleteRowById(event.target.dataset.id);
    }
    if(event.target.className === 'edit-row-btn') {
        handleEditRow(event.target.dataset.id);
    }
});

const searchBtn = document.querySelector('#search-btn');
searchBtn.onclick = function () {
    const searchValue = document.querySelector('#search-input').value;
    if(searchValue.length === 0) {
        fetchData()
        .then(data => loadHTMLTable(data['data']));
        return;
    }
    fetch(apiURL + 'search/' + searchValue)
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
}

const updateBtn  = document.querySelector('#update-row-btn');
updateBtn.onclick = function() {
    const updateNameInput = document.querySelector('#update-name-input');

    fetch(apiURL + 'update', {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            id: updateBtn.dataset.id,
            name: updateNameInput.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        }
    })
}

const addNameBtn = document.querySelector('#add-name-btn');
addNameBtn.onclick = function () {
    const nameInput = document.querySelector('#name-input');
    const name = nameInput.value;
    nameInput.value = "";

    fetch(apiURL + 'insert', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ name : name})
    })
    .then(response => response.json())
    .then(data => insertRowIntoTable(data['data']));
}

function fetchData() {
    return fetch(apiURL + 'getAll')
    .then(response => response.json())
}

function loadHTMLTable(data) {
    const table = document.getElementById('cal-index-data');
    
    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>"
        return;
    }

    let tableHtml = "";

    data.forEach(function ({id, date_added, tool_group, item_description, serial_num, specification, accepted_tolerance,
        cal_interval, cal_vendor, location, cal_date, cal_due, out_for_cal, disposition, active}) {
        tableHtml += "<tr>";
        tableHtml += `<td>${id}</td>`;
        tableHtml += `<td>${new Date(date_added).toLocaleString()}</td>`;
        tableHtml += `<td>${tool_group}</td>`;
        tableHtml += `<td>${item_description}</td>`;
        tableHtml += `<td>${serial_num}</td>`;
        tableHtml += `<td>${specification}</td>`;
        tableHtml += `<td>${accepted_tolerance}</td>`;
        tableHtml += `<td>${cal_interval}</td>`;
        tableHtml += `<td>${cal_vendor}</td>`;
        tableHtml += `<td>${location}</td>`;
        tableHtml += `<td>${new Date(cal_date).toLocaleDateString()}</td>`;
        tableHtml += `<td>${new Date(cal_due).toLocaleDateString()}</td>`;
        tableHtml += `<td>${new Date(out_for_cal).toLocaleDateString()}</td>`;
        tableHtml += `<td>${disposition}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id=${id}>Delete</td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id=${id}>Edit</td>`;
        tableHtml += "</tr>"
    });

    table.innerHTML = tableHtml;
}

function insertRowIntoTable(data) {
    const table = document.querySelector('table tbody');
    const isTableData = table.querySelector('.no-data');

    let tableHtml = "<tr>";

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if (key === 'dateAdded') {
                data[key] = new Date(data[key]).toLocaleString();
            }
            if (key === 'cal_date' || key === 'cal_due' || key === 'out_for_cal') {
                data[key] = new Date(data[key]).toLocaleDateString();
            }
            tableHtml += `<td>${data[key]}</td>`
        }
    }
    tableHtml += `<td><button class="delete-row-btn" data-id=${data.id}>Delete</td>`;
    tableHtml += `<td><button class="edit-row-btn" data-id=${data.id}>Edit</td>`;

    tableHtml += "</tr>";

    if (isTableData) {
        table.innerHTML = tableHtml;
    } else {
        const newRow = table.insertRow();
        newRow.innerHTML = tableHtml;
    }
}

function deleteRowById(id) {
    fetch(apiURL + 'delete/' + id, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchData().then(data => loadHTMLTable(data['data']));
        }
    });
}


// modal code
var modal = document.getElementById("itemModal");
var addItemModalBtn = document.getElementById("add-item-modal-btn");
var closeSpan = document.getElementsByClassName("close")[0];
const itemForm = document.getElementById("item-form");
const modalTitle = document.getElementById("modal-title");

function handleEditRow(id) {
    const submit = document.getElementById("submit");
    submit.dataset.id = id;

    itemForm.onsubmit = (e) => editItem(e);
    modalTitle.innerHTML = "Edit Item";
    modal.style.display = "block";


    // find correct row in table.
    const tableBody = document.getElementById("cal-index-data");
    let headers = document.querySelectorAll("#cal-index-headers > tr > th")

    let rowData = {};
    for (var i = 0, row; row = tableBody.rows[i]; i++) {
        if (row.cells[0].innerHTML === id) {
            for (var j = 0, cell; cell = row.cells[j]; j++){
                rowData[headers[j].getAttribute("name")] = cell.innerHTML;
            }
            break;
        }
     }
    //console.log(rowData);

    // populate fields with pre-existing data
    itemForm.querySelector("#group").value = rowData["group"];
    itemForm.querySelector("#item_description").value = rowData["item_description"];
    itemForm.querySelector("#serial_num").value = rowData["serial_num"];
    itemForm.querySelector("#specification").value = rowData["specification"];
    itemForm.querySelector("#accepted_tolerance").value = rowData["accepted_tolerance"];
    itemForm.querySelector("#cal_interval").value = rowData["cal_interval"];
    itemForm.querySelector("#cal_vendor").value = rowData["cal_vendor"];
    itemForm.querySelector("#location").value = rowData["location"];
    try {
        itemForm.querySelector("#cal_date").value = new Date(rowData["cal_date"]).toISOString().split('T')[0];
    } catch (e) {
        itemForm.querySelector("#cal_date").value = new Date("");
    }
    try {
        itemForm.querySelector("#cal_due").value = new Date(rowData["cal_due"]).toISOString().split('T')[0];
    } catch (e) {
        itemForm.querySelector("#cal_due").value = new Date("");
    }
    try {
        itemForm.querySelector("#out_for_cal").value = new Date(rowData["out_for_cal"]).toISOString().split('T')[0];
    } catch (e) {
        itemForm.querySelector("#out_for_cal").value = new Date("");
    }
}

function editItem(e) {
    e.preventDefault();
    let formData = new FormData(itemForm);
    let json = Object.fromEntries(formData);

    const submit = document.getElementById("submit");
    json['id'] = submit.dataset.id

    // convert dates to isostring
    let dataEntries = ['cal_date', 'cal_due', 'out_for_cal'];
    for (let dataKey of dataEntries) {
        if(json[dataKey] !== "")
            json[dataKey] = new Date(json[dataKey]).toISOString();
    }

    let jsonString = JSON.stringify(json);
    console.log(jsonString);

    
    // send data to api
    fetch(apiURL + 'update', {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json'
        },
        body: jsonString
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        }
    })

    // close modal and reset
    modal.style.display = "none";
    itemForm.reset();
    return;
}

function addNewItem(e) {
    e.preventDefault();
    let formData = new FormData(itemForm)
    let json = Object.fromEntries(formData);

    // convert dates to isostring
    let dateEntries = ['cal_date', 'cal_due', 'out_for_cal'];
    for (let dataKey of dateEntries) {
        if(json[dataKey] !== "") 
            json[dataKey] = new Date(json[dataKey]).toISOString();
    }
    
    let jsonString = JSON.stringify(json);
    console.log(jsonString);

    // send data to api
    fetch(apiURL + 'insert', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: jsonString
    })
    .then(response => response.json())
    .then(data => insertRowIntoTable(data['data']));

    // close modal and reset
    modal.style.display = "none";
    itemForm.reset();
}

addItemModalBtn.onclick = function() {
    itemForm.onsubmit =  (e) => addNewItem(e);
    modalTitle.innerHTML = "Add Item";
    modal.style.display = "block";
}

closeSpan.onclick = function() {
    modal.style.display = "none";
    itemForm.reset();
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        itemForm.reset();
    }
}