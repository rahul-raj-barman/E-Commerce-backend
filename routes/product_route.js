const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const ProductModel = mongoose.model("ProductModel");
const protectedResource = require("../middlewares/protectedResource");
const UserModel = mongoose.model("UserModel");
const ReviewModel = mongoose.model("ReviewModel");
const OrderModel = mongoose.model("OrderModel")
const CartItemsModel = mongoose.model("CartItemsModel");



async function getAllProducts() {
  try {
    const products = await ProductModel.find();
    return products;
  } catch (error) {
    console.error(error);
    return null;
  }
}

router.get("/allproducts", (req, res) => {
  let product = getAllProducts();
  product
    .then((result) => res.send(result))
    .catch((err) => {
      res.send(err);
    });
});

router.post("/increasecount", (req, res) => {
  let { _id, userId } = req.body;
  console.log(_id, userId);
  UserModel.findOneAndUpdate(
    { _id: userId, "cart._id": _id },
    { $inc: { "cart.$.count": 1 } },
    { new: true }
  )
    .then((userFound) => {
      console.log(userFound.cart.find((item) => item._id.toString() === _id));
      // Do something with the updated cart item here
    })
    .catch((err) => {
      console.log(err);
      res.status(201).json({});
    });
});

router.post("/decreasecount", (req, res) => {
  let { _id, userId } = req.body;
  console.log(_id, userId);
  UserModel.findOneAndUpdate(
    { _id: userId, "cart._id": _id },
    { $inc: { "cart.$.count": -1 } },
    { new: true }
  )
    .then((userFound) => {
      console.log(userFound.cart.find((item) => item._id.toString() === _id));
      // Do something with the updated cart item here
    })
    .catch((err) => {
      console.log(err);
      res.status(201).json({});
    });
});

router.post("/addtocart", (req, res) => {
  const count = 1;
  const { _id, quantity, userId, image } = req.body;
  console.log("image issss")
  console.log(image)
  ProductModel.find({ _id: _id })
    .then((productFound) => {
      console.log(productFound[0]);
      if (productFound[0].quantity - quantity < 1) {
        return res.status(400).json({
          error: "Out of stock",
        });
      }
      let updatedQauntity = (productFound[0].quantity -= quantity);
      const updated = ProductModel.findByIdAndUpdate(
        _id,
        { quantity: updatedQauntity },{image:image},
        { new: true }
      );
      const name = productFound[0].name;
      const price = productFound[0].price;
      // updated.then((resp) => console.log(resp));
      const newCartItem = new CartItemsModel({
        _id,
        name,
        price,
        count,
        image
      });

      UserModel.findOneAndUpdate(
        { _id: userId, "cart._id": newCartItem._id },
        { $inc: { "cart.$.count": 1 } },
        { new: true }
      )
      .then((result) => {
        if (result) {
          return res.status(201).json({
            message: "Item added to cart",
            cart: result.cart
          });
        } else {
          return UserModel.findOneAndUpdate(
            { _id: userId, "cart._id": { $ne: newCartItem._id } },
            { $push: { cart: newCartItem } },
            { new: true }
          )
          .then((result) => {
            if (result) {
              return res.status(201).json({
                message: "Item added to cart",
                cart: result.cart
              });
            } else {
              return res.status(404).json({
                error: "User not found"
              });
            }
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          error: err
        });
      });
  })
})

router.post("/addtocart", (req, res) => {
  const { _id, quantity, userId, image } = req.body;
  console.log(image)
    UserModel.updateOne({_id:userId, cart: {$elemMatch: {_id: _id}}})
    .then((found) => {
      res.status(201).json({
        message: found
      })
    })
    .catch((err) => {
      res.status(404).json({
        error : err
      })
    })
});

router.get("/getproductbyid/:id", (req, res) => {
  const id = req.params;
  console.log(id.id);
  ProductModel.findById(id.id)
    .then((product) => {
      res.status(200).json({
        product,
      });
    })
    .catch((err) => {
      res.status(404).json({
        error: "Product not found",
      });
    });
});

router.post("/addreview/:productId", (req, res) => {
  const _id = req.params.productId;
  let { user, rating, text } = req.body;
  rating = rating.slice(0,1);
  rating = Number(rating)
  console.log(rating)
  console.log(rating)
  const newReview = new ReviewModel({
    user,
    rating,
    text,
  });

  ProductModel.findOneAndUpdate(
    { _id: _id },
    { $push: { reviews: newReview } },
    { new: true }
  )
    .then((newObj) => {
      res.status(201).json({
        success: "Review added",
      });
    })
    .catch((error) => {
      res.status(404).json({
        error: "Product not found",
      });
    });
});


router.get("/userscartitems/:userId", (req, res) => {
  const userId = req.params.userId;
  UserModel.find({ _id: userId })
    .then((userFound) => {
      res.status(200).json({
        userFound,
      });
    })
    .catch((err) => {
      res.status(404).json({
        error: "Products couldn't found",
      });
    });
});

router.delete('/delproduct/:pid', (req, res) => {
  const pid = req.params.pid;
  const userid = req.body.id;
  console.log(req.body.id)
  UserModel.updateOne({_id: userid}, {$pull: {cart: { _id: pid}}}, {position: 0}, {new:true})
    .then(result => {
      if (result.nModified === 0) {
        return res.status(404).json({error: 'Product not found in cart'});
      }
      res.status(200).json({result});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Server error'});
    });
});


router.post('/setorder', (req, res) => {
  const {orderId, product, quantity} = req.body;
  console.log(req.body)
  console.log(typeof(orderId))
  const order = new OrderModel({
    orderId, product
  })
  order.save()
  .then((data) => {
    res.status(201).json({
      message : "Order Saved Successfully !!!"
    })
  })
  .catch((err) => {
    res.status(400).json({
      error: err
    })
  })
})

router.get('/getorders', (req, res) => {
  OrderModel.find()
  .then((orders) => {
    res.status(200).json({
      orders
    })

  })
  .catch((err) => {
    res.status(404).json({
      error: err
    })
  })
})

module.exports = router;
