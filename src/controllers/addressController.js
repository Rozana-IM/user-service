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
