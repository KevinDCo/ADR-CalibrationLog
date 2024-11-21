const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const dbService = require('./dbService')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

// calculate dates
function addMonths(date, months) {
    var d = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (date.getDate() != d) {
      date.setDate(0);
    }
    return date;
}

function evaluateDueDates(data) {
    // if there is cal_date and cal_interval and no cal_due => calculate cal due
    if (data['cal_date'] && data['cal_interval'] && !data['cal_due']) {
        data['cal_due'] = addMonths(new Date(data['cal_date']), data['cal_interval']).toISOString();
    }

    // set disposition
    // if there's out for cal date => set to OUT FOR CAL
    // if cal_due is soon (4 weeks) => set to CAL SOON, if cal_due is greater than 4 weeks ahead => set to CAL CURRENT
    // otherwise => set to OUT OF CAL
    calDueDate = new Date(data['cal_due']);
    date = new Date();
    weeksDiff = (calDueDate - date) / (1000 * 60 * 60 * 24 * 7);
    if(data['out_for_cal'] !== "") {
        data['disposition'] = "OUT FOR CAL";
    } else if (calDueDate > date) {
        data['disposition'] = "CAL SOON"
        if(weeksDiff > 4)
            data['disposition'] = "CAL CURRENT";
    } else {
        data['disposition'] = "OUT OF CAL";
    }

    return data;
}

// create
app.post('/insert', (request, response) => {
    let item = request.body;

    item = evaluateDueDates(item);

    const db = dbService.getDbServiceInstance();
    
    const result = db.insertNewItem(item);

    result
    .then(data => response.json({ data : data }))
    .catch(err => console.log(err));
});

// read
app.get('/getAll', (request, response) => {
    const db = dbService.getDbServiceInstance();

    const result = db.getAllData();

    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

/*
// update
app.patch('/update', (request, response) => {
    const { id, name } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.updateNameById(id, name);

    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});
*/
// update
app.patch('/update', (request, response) => {
    let item = request.body;

    item = evaluateDueDates(item);

    const db = dbService.getDbServiceInstance();

    const result = db.updateItemById(item['id'], item);
    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

// delete
app.delete('/delete/:id', (request, response) => {
    const { id } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.deleteRowById(id);

    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
})

// search
app.get('/search/:name', (request, response) => {
    const { name } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByName(name);

    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
}) 

app.listen(process.env.PORT, () => console.log('app is running'));