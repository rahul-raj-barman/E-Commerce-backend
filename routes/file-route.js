const express = require('express')
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose')
const ProductModel = mongoose.model('ProductModel')
const adminResource = require('../middlewares/adminResource')


const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, 'images/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 8024 * 8024 * 1
    },
    fileFilter: (req, file, cb) => {
        if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        }
        else {
            cb(null, false);
            return res.status(400).json({
                error: "File types allowed are .jpeg, .jpg, .png"
            })
        }
    }
})


router.post("/addproduct", adminResource , upload.single('image') ,(req, res) => {
  const { name, description, price, quantity, image, category} = req.body;
  console.log('Hiihih')
  if (!name || !description || !price || !quantity || !category) {
    return res.status(400).json({
      error: "One or more mandetory fields are empty",
    });
  }
  console.log(image)
  const product = new ProductModel({
    image,
    name,
    description,
    price,
    quantity,
    category
  });
  product
    .save()
    .then((newProduct) => {
      return res.status(201).json({
        result: "Product added successfully",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;