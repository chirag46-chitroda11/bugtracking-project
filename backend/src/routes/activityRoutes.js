const express = require("express");
const router = express.Router();
const { getRecentActivity } = require("../controller/activityController");

router.get("/recent", getRecentActivity);

module.exports = router;
