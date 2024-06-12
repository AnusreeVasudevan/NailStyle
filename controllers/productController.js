const productModel = require("../models/productModel");
const categoryModel = require('../models/categoryModel');
const userModel = require('../models/userModel');
const wishlistModel = require('../models/wishlistModel');

const loadProduct = async (req, res) => {
    try {

        const productdetails = await productModel.find().populate('category');
        const categorydetails = await categoryModel.find();
        res.render('listProduct', { product: productdetails, category: categorydetails, message: null });
    } catch (error) {
        console.log(error.message)
    }
};

const addProduct = async (req, res) => {
    try {
        console.log("keri")
        // Prepare images array from uploaded files
        const images = req.files ? req.files.map(file => file.filename) : [];

        console.log(req.body);

        // Create a new product instance
        const product = new productModel({
            name: req.body.name,
            description: req.body.description,
            images: images,
            countInStock: req.body.stock,
            category: req.body.category,
            price: req.body.price,
            discountPrice: req.body.discountPrice,
        });

        const savedProduct = await product.save();

        const categoryDetails = await categoryModel.find();

        if (savedProduct) {
            res.redirect('/admin/product');
        } else {
            res.render('admin-product', { cate: categoryDetails, message: 'Error saving product.' });
        }
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).send('Error saving product.');
    }
};

const activeStatus = async (req, res) => {
    try {
        const { id, action } = req.query;

        if (action === 'Inactive') {
            await productModel.findByIdAndUpdate({ _id: id }, { is_deleted: false });
        }
        else {
            await productModel.findByIdAndUpdate({ _id: id }, { is_deleted: true });
        }
        res.redirect('/admin/product')
    }
    catch (error) {
        console.log(error.message);
    }
}


const loadEdit = async (req, res) => {
    try {
        // Extract the product ID from the request query
        const id = req.query.id;

        // Retrieve the product data using the Product model
        const proData = await productModel.findById(id).populate('category');
        if(req.query.delete){
            proData.images = proData.images.filter(img => img.trim() !== req.query.delete.trim());
            await proData.save();
      
        }
        // Retrieve the category data using the Category model
        const catData = await categoryModel.find({});

        // Render the editProduct page with the retrieved data
        res.render("editproduct", { catData, proData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const editProduct = async (req, res) => {
    try {
        let existingImages = [];
        let existingProduct = await productModel.findById(req.query.id);
        console.log(existingProduct);
        
        const categorydetails = await categoryModel.find();
        
        
        // Existing images are retained unless new images are uploaded
        if (existingProduct && existingProduct.images && Array.isArray(existingProduct.images)) {
            existingImages = existingProduct.images;
        }
        console.log(req.body);
        let newImages = [];
        // Process new images if any
        if (req.files && req.files.length) {
            newImages = req.files.map(file => file.filename);
        }

        const allImages = existingImages.concat(newImages);

        // Limit images to 3
        if (allImages.length > 3) {
            return res.render('editProduct', { cate: categorydetails, proData: existingProduct, message: 'Maximum 3 images per product' });
        } else {
            // Update the product with new data
            const updatedProduct = await productModel.findByIdAndUpdate(req.query.id, {
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    images: allImages,
                    category: req.body.category,
                    price: req.body.price,
                    discountPrice: req.body.discountPrice,
                    countInStock: req.body.stock,
                }
            }, { new: true }); 

            if (updatedProduct) {
                return res.redirect('/admin/product');
            }
        }
    } catch (error) {
        console.log('update product:', error.message);
        res.status(500).send('An error occurred');
    }
};



const loadIndividualProduct = async (req, res) => {
    console.log("entered")
    try {
        // id='6630db4d994dff25ab730c82'
        const id = req.query.id;
 
        const userId = req.session.user; 
        let productData = await productModel.find({_id:id}).populate('category')
        productData=productData[0]
        console.log(productData,"aaaaaaaa")
        const relatedProducts = await productModel.find({ category: productData.category }).limit(5);

        // Assuming you have correctly imported isProductInWishlist function
        const isInWishlist = await isProductInWishlist(userId, id);
        console.log("bbbbb")
        if (productData) {
            console.log(productData.name)
            res.render('productDetails', {
                product: productData,
                category: productData.category.name,
                relatedProducts,
                isInWishlist
            });
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

// const loadIndividualProduct = async (req, res) => {
//     try {

//         const id = req.query.id;
//         const productData = await productModel.findById(id).populate('category');
//         const relatedProducts = await productModel.find({ category: productData.category }).limit(5);
//         console.log(relatedProducts,"relatedproduct");
//         console.log(productData,'pdt.............');
//         const categoryData = await categoryModel.find({});
//         console.log(categoryData,'category................');
//         const category = categoryData.find(cat => cat._id.equals(productData.category._id));
//         if (productData) {
//             res.render('productDetails', {
//                 product: productData,
//                 category:category.name,relatedProducts
//             })
//         }
//         else {
//             res.redirect('/home')
//         }
//     }
//     catch (error) {
//         console.log(error.message,);
//         res.status(500).send("Internal Server Error");
//     }
// }

async function isProductInWishlist(userId, productId) {
    const wishlist = await wishlistModel.findOne({ user: userId });
    if (!wishlist) return false;
    return wishlist.product.some(product => product.toString() === productId);
}

const loadaddproduct = async(req,res)=>{
    try{
        const category = await categoryModel.find();
        res.render('addproduct',{category})
    }catch(error){
        console.log(error.message)
    }
}


 
module.exports = {
    loadProduct,
    addProduct,
    activeStatus,
    loadEdit,
    editProduct,
    loadIndividualProduct,
    isProductInWishlist,
    loadaddproduct

}