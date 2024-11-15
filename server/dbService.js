const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const testTable = "debug_names";
const indexTable = 'tool_index';
const table = indexTable;

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
})

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    // console.log('db ' + connection.state);
})

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT * FROM ${table};`;

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            //console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewItem({ group, item_description,  
        serial_num, specification, 
        accepted_tolerance, cal_interval,
        cal_vendor, location, 
        cal_date, cal_due,
        out_for_cal, disposition}) {
        try {
            const dateAdded = new Date();
            const insertId = await new Promise((resolve, reject) => {
                const query = `INSERT INTO ${table} (date_added, tool_group, item_description, serial_num, specification, accepted_tolerance, cal_interval, cal_vendor, location, cal_date, cal_due, out_for_cal, disposition) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);`;

                                    connection.query(query, [dateAdded, group, item_description, serial_num, specification, accepted_tolerance, cal_interval, cal_vendor, location, cal_date, cal_due, out_for_cal, disposition], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.insertId);
                })
            });
            return {
                id : insertId,
                dateAdded : dateAdded,
                group : group,
                item_description : item_description,
                serial_num : serial_num,
                specification : specification,
                accepted_tolerance : accepted_tolerance,
                cal_interval : cal_interval,
                cal_vendor : cal_vendor,
                location : location,
                cal_date : cal_date,
                cal_due : cal_due,
                out_for_cal : out_for_cal,
                disposition : disposition
            };
        } catch (error) {
            console.log(error);
        }
    }

    async deleteRowById(id) {
        try {
            id = parseInt(id, 10);
            const response = await new Promise((resolve, reject) => {
                const query = `DELETE FROM ${table} WHERE ID = ?`;
    
                connection.query(query, [id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateNameById(id, name) {
        try {
            id = parseInt(id, 10);
            const response = await new Promise((resolve, reject) => {
                const query = `UPDATE ${table} SET name = ? WHERE id = ?`;
    
                connection.query(query, [name, id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async searchByName(name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT * FROM ${table} WHERE name = ?;`;

                connection.query(query, [name], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                    
                })
            });

            return response;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;