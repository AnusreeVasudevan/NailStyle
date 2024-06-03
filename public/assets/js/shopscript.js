async function generateProduct(pageno){
    console.log("entered")
    try {
        let categorySel=document.getElementById("category")
        let category=[]
        if(categorySel.value=="All"){
            for(let i=1;i<categorySel.options.length;i++){
                console.log(categorySel.options[i])
                 category.push(categorySel.options[i].value)
            }
        }else{
            category = [categorySel.value]
        }
        console.log("hello")
        let obj = {
        minamount:document.getElementById("minamount").value,
        maxamount:document.getElementById("maxamount").value,
        sort:document.getElementById("sort").value,
        search:document.getElementById("mysearch").value
        }
        obj.category = category
        checkbox=document.querySelector("input[id=checkbox]:checked")
        if(!pageno){
            pageno = 1
        }
        obj.page = pageno
        console.log(obj.page)
        if(checkbox){
             obj.stock = true
        }else{
            obj.stock = false
        }
        console.log(checkbox,"checkbox")
        console.log(obj,"obj")
        let res = await fetch('/myShop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                obj
            })
        });
        console.log(res,"res")
         let {message,product,limit,pro} = await res.json()
        console.log(message,product)
        let myProducts = loadProduct(product)
        document.getElementById("product").innerHTML = myProducts;
        let myPages = pagination(pro,limit,pageno)
        console.log(myPages,"Mypages")
        document.getElementById("pagination").innerHTML = myPages
}catch{

}

}

window.onload = generateProduct()

function loadProduct(product){
     productvalues = ""
    let i
    for( i=0;i<product.length;i++){
        productvalues += `<div class="col-xl-3 col-lg-4 col-sm-6 col-12">
        <div class="product-default-single-item product-color--golden"
        data-aos="fade-up" data-aos-delay="0">
        <div class="image-box">
            <a href="/productDetails?id=${product[i]._id}" class="image-link">
                    
                <img class="primary-image" src="/uploads/productImages/${product[i].images[0]}" style="max-width:300px; max-height: 300px;" alt="">
                <img class="hover-img" src="/uploads/productImages/${product[i].images[1]}" style="max-width:300px; max-height: 300px;" alt="">
            </a>
            <div class="action-link">
                <div class="action-link-left">
                    <a href="#"  data-bs-toggle="modal"
                        data-bs-target="#modalAddcart">Add to Cart</a>
                </div>
                <div class="action-link-right">
                    <a href="#" data-bs-toggle="modal"
                        data-bs-target="#modalQuickview"><i
                            class="icon-magnifier"></i></a>
                    <a href="wishlist.html"><i
                            class="icon-heart"></i></a>
                    <a href="compare.html"><i
                            class="icon-shuffle"></i></a>
                </div>
            </div>
        </div>
        <div class="content">
            <div class="content">
                <div class="content-left">
                    <h6 class="title"><a href="product-details.html">  ${product[i].name}  </a></h6>
                    <ul class="review-star">
                        <li class="fill"><i class="ion-android-star"></i></li>
                        <li class="fill"><i class="ion-android-star"></i></li>
                        <li class="fill"><i class="ion-android-star"></i></li>
                        <li class="fill"><i class="ion-android-star"></i></li>
                        <li class="empty"><i class="ion-android-star"></i></li>
                    </ul>
                </div>
                <div class="content-right">
                    <span class="old-price"><DEL>₹ ${ product[i].price } </DEL></span>
                    <span class="discount-price">₹ ${ product[i].discountPrice } </span>
                </div>
            </div>
            <div class="content-right">
                <!-- <span class="price">$68</span> -->
            </div>

        </div>
    </div>
</div>`
    }
    return productvalues;
}

function pagination(pro,limit,page){
    console.log("yessss")
    let pagevalues = ""
    let i
    let totalpages = Math.ceil(pro/limit)
    console.log(totalpages,"totalpages",pro,"product.length",limit,"limit")
    for( i=1;i<=totalpages;i++){
        if(page==i){
            pagevalues += `<li><a class="active" href="#" onclick="generateProduct(${i})">${i}</a></li>`
        }else{
            pagevalues += `<li><a  href="#" onclick="generateProduct(${i})">${i}</a></li>`
        }
        // console.log(pagevalues,"pagevalues")
        console.log(page,"pageeee")
    }
    return pagevalues;
}

{/* <li><a class="active" href="#" onclick="generateProduct(1)">1</a></li>
<li><a href="#" onclick="generateProduct(2)">2</a></li>
<li><a href="#"><i class="ion-ios-skipforward"></i></a></li> */}