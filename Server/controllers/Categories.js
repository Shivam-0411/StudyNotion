const Category = require("../models/category");

exports.createCategories = async(req, res) => {
    try {
        const {name, description} = req.body;
        if(!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const categoryDetails = await Tag.create({name: name, description: description});
        console.log(categoryDetails);
        return res.status(200).json({
            success: true,
            message: "Category created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllCategories = async(req, res) => {
    try {
        const allCategories = await Category.find({}, {name: true, description: true});
        console.log(allCategories);
        res.status(200).json({
            success: true,
            message: "All categories are returned",
            allCategories
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//add lines from helper - Category.js