const Category = require("../models/categoryModel");
const bcrypt = require('bcrypt');
const ProductModel = require("../models/productModel");

const createCategory = async (req, res) => {
    try {
        const name = req.body.name;
        const dis = req.body.description;
        const existingcate = await Category.findOne({
        
            name: name.toLowerCase(),
        
      });
      //console.log(existingUser);
      if(existingcate ){
        console.log(existingcate,"existing cat");
        const categorydetails = await Category.find();
          res.render('category',{category:categorydetails,message:'name is already entered'})
      }
    else{

        // Create a new category object with the provided name and description
        const cat = new Category({
            name: name.toLowerCase(),
            description: dis 
        });

        // Save the new category to the database
        const catData = await cat.save();

        // Respond with a success status
        res.redirect('/admin/category');}
      
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
        let val=req.body.discount
      const Data = await Category.findByIdAndUpdate({_id:req.query.id},{$set:{ discount:req.body.discount,name:req.body.name,description:req.body.description}});
      if(req.body.discount==0){
        //const products = await ProductModel.findByIdAndUpdate({category:req.query.id})
        //console.log(await ProductModel.find())
        for (const product of products) {
            product.discountPrice = product.price;
            product.discount=0
            console.log(product.discount)
            await product.save();
            console.log(product)
        }
      }
      else{
        val=(100-Number(val))/100
        const products = await ProductModel.findByIdAndUpdate({category:req.query.id})
        console.log(products)

        for (const product of products) {
            product.discountPrice = product.price;
            product.discount=percent
            product.discountPrice *= val;
            await product.save();
            console.log(product)

        }
      }


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
//i need to convert object id, not the entire object