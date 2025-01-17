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
        const categoryDetails = await Category.create({name: name, description: description});
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
        return res.status(200).json({
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

exports.categoryPageDetails = async(req, res) => {
    try {
        //get category id
        const {categoryId} = req.body;
        //get courses in that category
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();
        //validation 
        if(!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "No courses in this category"
            })
        }
        //get courses for different category
        const otherCategories = await Category.find({_id: {$ne: categoryId}}).populate("courses").exec();
        //get top 10 selling courses - homework

        //return res
        return res.status(200).json({
            success: true,
            message: "Category page details",
            selectedCategory,
            otherCategories
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}