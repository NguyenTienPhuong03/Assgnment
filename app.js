const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
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

app.get('/addProduct', (req, res) => {
  // Đọc dữ liệu từ tập tin products.json
  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.sendStatus(500);
    }

    // Chuyển dữ liệu thành mảng JSON
    const products = JSON.parse(data);

    // Trả về trang thêm sản phẩm và truyền dữ liệu vào template
    res.render('addProduct', { products });
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Xử lý yêu cầu cập nhật sản phẩm
app.get('/editProduct', (req, res) => {
  // Lấy thông tin productName từ query params
  const { productName } = req.query;

  // Đọc dữ liệu hiện có từ tập tin products.json
  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.sendStatus(500);
    }

    // Chuyển dữ liệu thành mảng JSON
    const products = JSON.parse(data);

    // Tìm sản phẩm trong mảng dựa trên thông tin productName
    const productToUpdate = products.find((product) => product.productName === productName);

    // Nếu không tìm thấy sản phẩm, trả về lỗi 404 (Not Found)
    if (!productToUpdate) {
      return res.sendStatus(404);
    }

    // Render trang form cập nhật với thông tin sản phẩm để fill vào
    res.render('updateProduct', { product: productToUpdate });
  });
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
  const { productName, quantity, price } = req.body;
  const imageFileName = req.file ? req.file.filename : '';
  console.log('Image file name:', imageFileName);

  // Đọc dữ liệu hiện có từ tập tin products.json
  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.sendStatus(500);
    }

    // Chuyển dữ liệu thành mảng JSON
    const products = JSON.parse(data);

    // Tạo đối tượng mới để thêm vào mảng
    const newProduct = {
      productName,
      quantity,
      price,
      image: `images/${imageFileName}`,
    };

    // Thêm đối tượng mới vào mảng sản phẩm
    products.push(newProduct);

    // Ghi mảng sản phẩm đã cập nhật vào tập tin products.json
    fs.writeFile(productsFilePath, JSON.stringify(products), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.sendStatus(500);
      }

      // Đã thêm sản phẩm thành công, chuyển hướng về trang thêm sản phẩm hoặc trang thành công
      res.redirect('/addProduct');
    });
  });
});

// Xử lý yêu cầu xóa sản phẩm
app.post('/deleteProduct', (req, res) => {
  // Lấy thông tin tên sản phẩm muốn xóa từ form
  const { productName } = req.body;

  // Đọc dữ liệu hiện có từ tập tin products.json
  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.sendStatus(500);
    }

    // Chuyển dữ liệu thành mảng JSON
    let products = JSON.parse(data);

    // Tìm vị trí sản phẩm trong mảng dựa trên thông tin tên sản phẩm muốn xóa
    const productIndex = products.findIndex((product) => product.productName === productName);

    // Nếu không tìm thấy sản phẩm, trả về lỗi 404 (Not Found)
    if (productIndex === -1) {
      return res.sendStatus(404);
    }

    // Xóa sản phẩm khỏi mảng
    products.splice(productIndex, 1);

    // Ghi mảng sản phẩm đã cập nhật vào tập tin products.json
    fs.writeFile(productsFilePath, JSON.stringify(products), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.sendStatus(500);
      }

      // Đã xóa sản phẩm thành công, chuyển hướng về trang thêm sản phẩm hoặc trang thành công
      res.redirect('/addProduct');
    });
  });
});

// Xử lý yêu cầu cập nhật thông tin sản phẩm
app.post('/updateProduct', (req, res) => {
  // Lấy thông tin sản phẩm từ form
  const { productName, quantity, price } = req.body;

  // Đọc dữ liệu hiện có từ tập tin products.json
  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.sendStatus(500);
    }

    // Chuyển dữ liệu thành mảng JSON
    let products = JSON.parse(data);

    // Tìm sản phẩm trong mảng dựa trên thông tin productName
    const productToUpdate = products.find((product) => product.productName === productName);

    // Nếu không tìm thấy sản phẩm, trả về lỗi 404 (Not Found)
    if (!productToUpdate) {
      return res.sendStatus(404);
    }

    // Cập nhật thông tin sản phẩm
    productToUpdate.quantity = quantity;
    productToUpdate.price = price;

    // Ghi mảng sản phẩm đã cập nhật vào tập tin products.json
    fs.writeFile(productsFilePath, JSON.stringify(products), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.sendStatus(500);
      }

      // Đã cập nhật sản phẩm thành công, chuyển hướng về trang thêm sản phẩm hoặc trang thành công
      res.redirect('/addProduct');
    });
  });
});



// Xử lý các yêu cầu khác

const port = 3000; // Đã khai báo và gán giá trị cho biến port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
