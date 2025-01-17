const express = require("express");
const router = express.Router();

//Importing controllers from Courses.js
const {createCourse, showAllCourses, getCourseDetails} = require("../controllers/Courses");

//Importing controllers from Categories.js
const {createCategories, getAllCategories, categoryPageDetails} = require("../controllers/Categories");

//Importing controllers from Sections.js
const {createSection, updateSection, deleteSection} = require("../controllers/Section");

//Importing controllers from SubSections.js
const {createSubsection, updateSubsection, deleteSubsection} = require("../controllers/SubSection");

//Importing controllers from RatingAndReview.js
const {createRating, getAverageRating, getAllRating, getRatingByCourse} = require("../controllers/RatingAndReview");

//Importing middlewares from AuthZ.js
const {auth, isInstructor, isStudent, isAdmin} = require("../middlewares/AuthZ");

//routes for Instructors
router.post("/createCourse", auth, isInstructor, createCourse);
router.get("/showAllCourses", showAllCourses);
router.get("/getCourseDetails", getCourseDetails);
router.post("/createSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);
router.post("/createSubsection", auth, isInstructor, createSubsection);
router.post("/updateSubsection", auth, isInstructor, updateSubsection);
router.post("/deleteSubsection", auth, isInstructor, deleteSubsection);

//routes for admin
router.post("/createCategories", auth, isAdmin, createCategories);
router.get("/getAllCategories", getAllCategories);
router.post("/categoryPageDetails", categoryPageDetails);

//routes for students
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAvgRating", getAverageRating);
router.get("/getAllRating", getAllRating);
router.get("/getRatingByCourse", getRatingByCourse);

module.exports = router;