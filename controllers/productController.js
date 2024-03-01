const productModel = require("../models/productModel");
const categoryModel = require('../models/categoryModel');
const userModel = require('../models/userModel');

const loadProduct = async (req, res) => {
    try {

        const productdetails = await productModel.find().populate('category');
        const categorydetails = await categoryModel.find();
        console.log(productdetails,"detailspdt");
        res.render('addProduct', { product: productdetails, category: categorydetails, message: null });
    } catch (error) {
        console.log(error.message)
    }
};

const addProduct = async (req, res) => {
    try {
        // Prepare images array from uploaded files
        const images = req.files ? req.files.map(file => file.filename) : [];

        console.log(images);

        // Create a new product instance
        const product = new productModel({
            name: req.body.name,
            description: req.body.description,
            images: images, // Assuming req.files is an array of file objects
            // brand: req.body.brand,
            countInStock: req.body.stock,
            category: req.body.category,
            price: req.body.price,
            discountPrice: req.body.discountPrice,
            // afterDiscount: Math.floor(parseInt(req.body.price) - (parseInt(req.body.price) * (parseInt(req.body.discountPrice) / 100)))
        });

        const savedProduct = await product.save();

        // Fetch category details, assuming you need them for the response or further processing
        const categoryDetails = await categoryModel.find();

        if (savedProduct) {
            // Redirect to the product list page in the admin panel if the product is saved successfully
            res.redirect('/admin/product');
        } else {
            // If the product wasn't saved for some reason, render the admin product page with an error message
            // This else block may be unnecessary since an unsaved product should throw an error caught by the catch block
            res.render('admin-product', { cate: categoryDetails, message: 'Error saving product.' });
        }
    } catch (error) {
        console.error('Error saving product:', error);
        // Render or redirect with error information, depending on your error handling strategy
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
        const proData = await productModel.findById(id);

        // Retrieve the category data using the Category model
        const catData = await categoryModel.find({});

        // Render the editProduct page with the retrieved data
        res.render("editProduct", { catData, proData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const editProduct = async (req, res) => {
    try {

        let existingImages = [];
        const existingProduct = await productModel.findById(req.query.id);
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
            return res.render('editProduct', { cate: categorydetails, pro: existingProduct, message: 'Maximum 3 images per product' });
        } else {
            // Update the product with new data
            const updatedProduct = await productModel.findByIdAndUpdate(req.query.id, {
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    images: allImages,
                    category: req.body.category,
                    price: req.body.price,
                    discountPrice: req.body.discountPrice, // Ensure this field exists in your schema
                    countInStock: req.body.stock,
                }
            }, { new: true }); // {new: true} to return the updated object

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
    try {

        const id = req.query.id;
        const productData = await productModel.findById({ _id: id}).populate('category');
        const relatedProducts = await productModel.find({ category: productData.category }).limit(5);
        console.log(relatedProducts,"relatedproduct");
        console.log(productData,'pdt.............');
        const categoryData = await categoryModel.find({});
        console.log(categoryData,'category................');
        const category = categoryData.find(cat => cat._id.equals(productData.category._id));
        if (productData) {
            res.render('productDetails', {
                product: productData,
                category:category.name,relatedProducts
            })
        }
        else {
            res.redirect('/home')
        }
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

// const fetchRelatedProducts = async (categoryId, limit) => {
//     try {
//         const relatedProducts = await productModel.find({ category: categoryId }).limit(limit);
//         return relatedProducts;
//     } catch (error) {
//         throw new Error(`Error fetching related products: ${error.message}`);
//     }
// };




module.exports = {
    loadProduct,
    addProduct,
    activeStatus,
    loadEdit,
    editProduct,
    loadIndividualProduct
}