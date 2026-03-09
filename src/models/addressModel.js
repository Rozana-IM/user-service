const db = require("../config/db");

exports.addAddress = (userId, data, callback) => {

const sql = `
INSERT INTO addresses 
(user_id, full_name, phone, address_line1, city, state, pincode, country)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

db.query(sql,
[
userId,
data.full_name,
data.phone,
data.address_line1,
data.city,
data.state,
data.pincode,
data.country
],
callback);

};

exports.getAddresses = (userId, callback) => {

db.query(
"SELECT * FROM addresses WHERE user_id = ?",
[userId],
callback
);

};
