const apiURL = 'http://localhost:5000/';

document.addEventListener('DOMContentLoaded', function () {
    fetchData()
    .then(data => loadHTMLTable(data['data']));
});

document.querySelector('table tbody').addEventListener('click', function(event) {
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
    return fetch(apiURL+ 'getAll')
    .then(response => response.json())
}

function loadHTMLTable(data) {
    const table = document.querySelector('table tbody');
    
    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>"
        return;
    }

    let tableHtml = "";

    data.forEach(function ({id, name, date_added}) {
        tableHtml += "<tr>";
        tableHtml += `<td>${id}</td>`;
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>${new Date(date_added).toLocaleString()}</td>`;
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

function handleEditRow(id) {
    const updateSection = document.querySelector('#update-row');
    const updateRowBtn = document.querySelector('#update-row-btn');
    const updateNameInput = document.querySelector('#update-name-input')


    if(updateSection.hidden || updateRowBtn.dataset.id === id) {
        updateSection.hidden = !updateSection.hidden;
    }

    
    updateRowBtn.dataset.id = id;
    updateNameInput.value = "";
}