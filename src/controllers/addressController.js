const db = require("../db");

// ================= SAVE ADDRESS =================
exports.saveAddress = async (req, res) => {
  try {

    const userId = req.user.id;

    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      country
    } = req.body;

    const result = await db.query(
      `INSERT INTO user_addresses 
      (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        full_name,
        phone,
        address_line1,
        address_line2 || "",
        city,
        state,
        pincode,
        country || "India"
      ]
    );

    res.json({
      success: true,
      addressId: result.insertId
    });

  } catch (err) {
    console.error("❌ Save address error:", err);
    res.status(500).json({ error: "Failed to save address" });
  }
};

// ================= GET USER ADDRESSES =================
exports.getUserAddresses = async (req, res) => {
  try {

    const userId = req.user.id;

    const addresses = await db.query(
      "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(addresses);

  } catch (err) {
    console.error("❌ Fetch addresses error:", err);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

// ================= DELETE USER ADDRESSES =================

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const result = await db.query(
      "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Delete address error:", err);
    res.status(500).json({ error: "Failed to delete address" });
  }
};
