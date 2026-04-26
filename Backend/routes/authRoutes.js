const express = require("express");
const router  = express.Router();
const { register, login, getMe, promoteUser, demoteUser, getAdmins } = require("../controllers/authController");
const { protect, levelGuard } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login",    login);
router.get ("/me",       protect, getMe);

// Admin management — level 3 (city) can promote/demote anyone
// level 2 (district) can promote to level 1 only (enforced in controller)
router.patch("/promote", protect, levelGuard(2), promoteUser);
router.patch("/demote",  protect, levelGuard(2), demoteUser);
router.get  ("/admins",  protect, levelGuard(1), getAdmins);

module.exports = router;