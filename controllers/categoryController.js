const Category = require("../models/categoryModel");
const bcrypt = require('bcrypt');

const createCategory = async (req, res) => {
    try {
        const name = req.body.name;
        const dis = req.body.description;

        // Create a new category object with the provided name and description
        const cat = new Category({
            name: name,
            description: dis 
        });

        // Save the new category to the database
        const catData = await cat.save();

        // Respond with a success status
        res.redirect('/admin/category');
      
    } catch (error) {
        // Log any errors that occur during the process
        console.log(error.message);
        // Respond with an error status
        res.status(500).json({ status: false, error: "Internal Server Error" });
    }
};

const editCategoryLoad = async (req, res) => {
    try {
        const id = req.query.id;
        
        // Find the category by its ID
        const categoryData = await Category.findById(id);

        if (categoryData) {
            // If category found, render the edit category page with category data
            res.render('edit-cate', { category: categoryData });
        } else {
            // If category not found, redirect to the admin dashboard or any appropriate page
            res.redirect('/admin/category');
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.log(error.message);
        // You might want to render an error page or send an appropriate response
        res.status(500).send('Internal Server Error');
    }
};

const updateCate = async(req,res)=>{
    try{
      const Data=await Category.findByIdAndUpdate({_id:req.query.id},{$set:{ name:req.body.name,description:req.body.description}});
      console.log(Data);
      if(Data){
        res.redirect('/admin/category');
      }
      
    }
    catch(error){
      console.log(error.message);
    }
  };

const deleteCate = async (req, res) => {
    try {
        console.log("deleted");
        const id = req.query.id;
        // Soft delete by updating the 'is_deleted' field to true
        await Category.findByIdAndUpdate(id, { is_active: false });
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
    }
};


  
  


module.exports = {
    createCategory,
    editCategoryLoad,
    updateCate,
    deleteCate
};
