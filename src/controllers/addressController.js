const Address = require("../models/addressModel");

exports.addAddress = (req,res)=>{

const userId = req.params.id;
const data = req.body;

Address.addAddress(userId,data,(err,result)=>{

if(err){
return res.status(500).json(err);
}

res.json({
message:"Address added successfully"
});

});

};

exports.getAddresses = (req,res)=>{

const userId = req.params.id;

Address.getAddresses(userId,(err,result)=>{

if(err){
return res.status(500).json(err);
}

res.json(result);

});

};

exports.saveAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      full_name, phone, address_line1,
      address_line2, city, state, pincode, country
    } = req.body;

    const result = await db.query(
      `INSERT INTO user_addresses 
      (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, full_name, phone, address_line1, address_line2, city, state, pincode, country]
    );

    res.json({ success: true, addressId: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save address" });
  }
};


exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await db.query(
      "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(addresses);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};
