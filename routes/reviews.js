const express = require("express");
const router = express.Router({ mergeParams: true });
const { addReview } = require("../controllers/review");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
    .post(protect, authorize("admin", "user"), addReview);

module.exports = router;
