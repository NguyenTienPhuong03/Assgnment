const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const Product = require("./models/modelProduct");
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const mongoose = require('mongoose');

const uri = 'mongodb+srv://tienphuongnguyen7:Phuong2k3@baitap.pk7r33h.mongodb.net/dbProduct?retryWrites=true&w=majority';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const app = express();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {

      var dir = './uploads';

      if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, 'uploads')
  },
  filename: function (req, file, cb) {

      let fileName = file.originalname;
      arr = fileName.split('.');

      let newFileName = '';

      for (let i =0; i< arr.length; i++) {
          if (i != arr.length - 1) {
              newFileName += arr[i];
          } else {
              newFileName += ('-' + Date.now() + '.' + arr[i]);
          }
      }

      cb(null, newFileName)
  }
})
const upload = multer({ storage });

// Cấu hình Handlebars
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

// Cấu hình body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const productsFilePath = './products.json';

// Đăng ký route và xử lý yêu cầu
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/addProduct',async (req, res) => {
  // Đọc dữ liệu từ tập tin products.json
  try {
    const products = await Product.find({}).lean();
    
    res.render('addProduct', { products });
  } catch (error) {
    console.error('Lỗi lấy dữ liệu:', error);
    res.status(500).json({ error: 'Lỗi lấy dữ liệu' });
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Xử lý form đăng nhập
app.post('/login', (req, res) => {
  // Xử lý thông tin đăng nhập ở đây
  const { email, password } = req.body;
  // Kiểm tra thông tin đăng nhập
  if (email === 'example@email.com' && password === 'password') {
    // Đăng nhập thành công, chuyển hướng tới trang thêm sản phẩm
    res.redirect('/addProduct');
  } else {
    // Đăng nhập thất bại, chuyển hướng tới trang đăng nhập lại hoặc trang lỗi
    res.redirect('/');
  }
});

app.post('/addProduct', upload.single('image'), (req, res) => {
  // Lấy thông tin sản phẩm từ form
  let productName = req.body.productName;
  let price = req.body.price;
  let quantity = req.body.quantity;
  let file = req.body.image;
    if (!file) {
      const error = new Error('Please upload a photo');
      error.httpStatusCode = 400;
      return next(error);
    }
  
  let addProduct = new Product({
      productName: productName,
      price: price,
      image: file,
      quantity: quantity
  })

  addProduct.save();
  let listproduct= Product.find().lean();
  
  res.redirect('/addProduct');
  });

// Xử lý yêu cầu xóa sản phẩm
app.post('/delete-product/:id', async(req, res) => {
  const productId = req.params.id;

  try {
    await Product.findByIdAndDelete(productId);
    res.redirect('/addProduct'); // Sau khi xóa, chuyển hướng về trang danh sách sản phẩm
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Internal Server Error');
  }
    });

// Xử lý yêu cầu cập nhật thông tin sản phẩm
app.post('/updateproduct/update/:id',async (req, res) => {
  const productId = req.params.id;
  const { productName, price, image,quantity } = req.body;
   console.log(req.body.productName);
  // Thực hiện lưu dữ liệu vào MongoDB
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { productName, price, image, quantity },
      { new: true }
    );
    console.log('Dữ liệu đã được cập nhật:', updatedProduct);
    res.redirect('/addProduct'); // Điều hướng về trang chủ hoặc trang xác nhận
  } catch (error) {
    console.error('Lỗi khi cập nhật dữ liệu:', error);
   
  }
});

app.get('/updateproduct/:id', async(req, res)=>{
  const product=await Product.findById(req.params.id).lean();
  res.render('home',{
    layout:'updateProduct',
    data:product
  });
});


// Xử lý các yêu cầu khác

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
