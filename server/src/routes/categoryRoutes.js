const express = require("express");
const { getCategories } = require("../controllers/categorycontrollers");

const router = express.Router();

router.get("/", getCategories);

module.exports = router;