const mongoose = require('mongoose');
 
const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
   
  },
  price:{
    type: Number,
    
  },
  image: {
    type: String,
    
  },
  quantity:{
    type: Number,
   
  }
});

const Product = mongoose.model('tbProduct', ProductSchema);
module.exports = Product;