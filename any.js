// let obj = {
//     name:"nailpolish",
//     batch:21
// }
// let {name,batch} = obj
// // class Animal{
//     constructor(name,color,age){
//         this.name=name
//         this.age=age
//         this.color=color
//         this.famliy="mammalia"
//     }
//     printaaa(){
//         console.log(this.name, this.age, this.color, this.famliy)
//     }
// }

// let cat = new Animal("Tom","Black",2)
// console.log(cat)
// let dog = new Animal("Spike","Grey",4)
// console.log(dog)
// cat.printaaa()
// dog.printaaa()

/*

class Animal{
    constructor(name,age,color){
        this.age=age
        this.name=name
        this.color=color
        this.famliy="mammalia"
    }
    printaaa(){
        console.log(this.name, this.age, this.color, this.famliy)
    }
}

let cat = new Animal("Tom",2,"Black")
console.log(cat)


*/
//over riding

// let a = "10",b;

// console.log(a+b)
// function print(a){
//     console.log( a)
// }

// print(2)
// print(100)

/*<div class="col-lg-6">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h4>Basic</h4>
                        </div>
                        <div class="card-body">
                            <form>
                                <div class="mb-4">
                                    <label for="product_name" class="form-label">Product title</label>
                                    <input type="text" placeholder="Type here" class="form-control" id="product_name">
                                </div>
                                <div class="mb-4">
                                    <label class="form-label">Full description</label>
                                    <textarea placeholder="Type here" class="form-control" rows="4"></textarea>
                                </div>
                                <div class="row">
                                    <div class="col-lg-4">
                                        <div class="mb-4">
                                            <label class="form-label">Regular price</label>
                                            <div class="row gx-2">
                                                <input placeholder="$" type="text" class="form-control">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-4">
                                        <div class="mb-4">
                                            <label class="form-label">Promotional price</label>
                                            <input placeholder="$" type="text" class="form-control">
                                        </div>
                                    </div>
                                    <div class="col-lg-4">
                                        <label class="form-label">Currency</label>
                                        <select class="form-select">
                                            <option> USD </option>
                                            <option> EUR </option>
                                            <option> RUBL </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label">Tax rate</label>
                                    <input type="text" placeholder="%" class="form-control" id="product_name">
                                </div>
                                <label class="form-check mb-4">
                                    <input class="form-check-input" type="checkbox" value="">
                                    <span class="form-check-label"> Make a template </span>
                                </label>
                            </form>
                        </div>
                    </div> <!-- card end// -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h4>Shipping</h4>
                        </div>
                        <div class="card-body">
                            <form>
                                <div class="row">
                                    <div class="col-lg-6">
                                        <div class="mb-4">
                                            <label for="product_name" class="form-label">Width</label>
                                            <input type="text" placeholder="inch" class="form-control" id="product_name">
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="mb-4">
                                            <label for="product_name" class="form-label">Height</label>
                                            <input type="text" placeholder="inch" class="form-control" id="product_name">
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <label for="product_name" class="form-label">Weight</label>
                                    <input type="text" placeholder="gam" class="form-control" id="product_name">
                                </div>
                                <div class="mb-4">
                                    <label for="product_name" class="form-label">Shipping fees</label>
                                    <input type="text" placeholder="$" class="form-control" id="product_name">
                                </div>
                            </form>
                        </div>
                    </div> <!-- card end// -->
                </div>
                
                <div class="card-body">
                            <form method="post" action="" enctype="multipart/form-data" onsubmit="return validateForm()">
                                <!-- General Information Section -->
                                <div class="mb-4">
                                    <label for="product_name" class="form-label">Name</label>
                                    <input type="text" placeholder="Type product name here" class="form-control" name="name" id="product_name">
                                    <p id="nameError" class="text-danger"></p> <!-- Placeholder for name error -->
                                </div>
                                <div class="mb-4">
                                    <label for="product_description" class="form-label">Description</label>
                                    <textarea placeholder="Type product description here" class="form-control" name="description" id="product_description" rows="4"></textarea>
                                    <p id="descriptionError" class="text-danger"></p> <!-- Placeholder for description error -->
                                </div>
                            
                                <!-- Pricing Section -->
                                <div class="row">
                                    <div class="col-lg-4">
                                        <div class="mb-4">
                                            <label for="regular_price" class="form-label">Price</label>
                                            <input placeholder="₹" type="text" class="form-control" name="price" id="regular_price">
                                            <p id="priceError" class="text-danger"></p> <!-- Placeholder for price error -->
                                        </div>
                                    </div>
                                    <div class="col-lg-4">
                                        <div class="mb-4">
                                            <label for="discount_price" class="form-label">Discount Price</label>
                                            <input placeholder="₹" type="text" class="form-control" name="discountPrice" id="discount_price">
                                            <p id="discountPriceError" class="text-danger"></p> <!-- Placeholder for discount price error -->
                                        </div>
                                    </div>
                                    <div class="col-lg-4">
                                        <div class="mb-4">
                                            <label for="stock_count" class="form-label">Count of Stock</label>
                                            <input type="number" placeholder="Qty" class="form-control" name="stock" id="stock_count">
                                            <p id="stockError" class="text-danger"></p> <!-- Placeholder for stock error -->
                                        </div>
                                    </div>
                                </div>
                            
                                <!-- Category Section -->
                                <div class="mb-4">
                                        <% if(category.length > 0) {
                                            for(let i=0; i<category.length; i++) { %>
                                        <label class="mb-2 form-check form-check-inline" style="width: 45%;">
                                            <input class="form-check-input" value="<%=category[i]._id%>" name="category" id="category_<%= i %>" type="radio">
                                            <span class="form-check-label"> <%=category[i].name%> </span>
                                        </label>
                                        <%}}%>
                                        <div id="categoryError" class="text-danger"></div> <!-- Placeholder for category error -->
                                </div>
                            
                                <!-- Media Section for Images -->
                                <div class="mb-4">
                                    <label for="product_images" class="form-label">Images</label>
                                    <input type="file" class="form-control" name="images" id="product_images" multiple>
                                    <small class="form-text text-muted">You can select multiple images.</small>
                                    <p id="imagesError" class="text-danger"></p> <!-- Placeholder for images error -->
                                </div>
                            
                                <div class="mb-4">
                                    <div id="mainError" class="text-danger"></div> <!-- Main error message placeholder -->
                                    <button type="submit" class="btn btn-primary">Submit</button>
                                </div>
                            </form>
                            
                            
                        </div>
                */

                        const requestAccept = async (req, res) => {
                            try {
                              const { orderId, userId } = req.body;
                          
                              const canceledOrder = await orderModel.findOne({ oId: orderId });
                              if (!canceledOrder) {
                                return res.status(404).json({ success: false, message: 'Order not found' });
                              }
                          
                              const user = await User.findById(userId);
                              if (!user) {
                                return res.status(404).json({ success: false, message: 'User not found' });
                              }
                          
                              // Iterate over each item in the canceled order to update product stock.
                              for (const orderItem of canceledOrder.items) {
                                let product = await productModel.findById(orderItem.productId).exec();
                                console.log('Product ID:', orderItem.productId, 'Quantity:', orderItem.quantity);
                                console.log('Product:', product);
                                if (product) {
                                  product.countInStock += Number(orderItem.quantity);
                                  await product.save();
                                }
                              }
                          
                              // Process each request in the canceledOrder.
                              for (let request of canceledOrder.requests) {
                                if (request.status === 'Pending') { // Ensure we're only updating pending requests.
                                  const newStatus = request.type === 'Cancel' ? 'Canceled' : 'Returned';
                                  await orderModel.findOneAndUpdate(
                                    { oId: orderId, 'requests._id': request._id }, // Match the specific request by its ID.
                                    {
                                      $set: {
                                        status: newStatus,
                                        'requests.$.status': 'Accepted' // Update the matched request status.
                                      }
                                    },
                                    { new: true }
                                  );
                          
                                  if (request.type === 'Cancel') {
                                    let wallet = await walletModel.findOne({ user: userId });
                                    if (!wallet) {
                                      // If no wallet exists for the user, create a new one
                                      wallet = new walletModel({ user: userId, balance: 0, actions: [] });
                                    }
                          
                                    const credit = canceledOrder.billTotal;
                                    wallet.balance += credit; // Add the credit to the wallet's balance
                                    wallet.actions.push({
                                      amount: credit,
                                      ref: `Order cancellation - ${orderId}`,
                                      order: canceledOrder._id,
                                      createdAt: new Date()
                                    });
                                    await wallet.save();
                                  }
                                }
                              }
                          
                              return res.status(200).json({ success: true, message: 'Order status updated successfully and amount credited to wallet' });
                            } catch (error) {
                              console.error(error);
                              return res.status(500).json({ success: false, message: 'Internal server error' });
                            }
                          };
                          