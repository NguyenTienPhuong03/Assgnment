var express = require('express');
var expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');
const data = require('./data'); // Đường dẫn tới file data.js

const app = express();

// Cấu hình Handlebars
app.engine('.hbs', expressHbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');

// Cấu hình body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Đăng ký route và xử lý yêu cầu
app.get('/', (req, res) => {
  res.render('home',{ data });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Xử lý form đăng nhập
app.post('/login', (req, res) => {
  // Xử lý đăng nhập tại đây
    // Xử lý thông tin đăng nhập ở đây
    const { email, password } = req.body;
    // Kiểm tra thông tin đăng nhập
    if (email === 'example@email.com' && password === 'password') {
      // Đăng nhập thành công, chuyển hướng tới trang chính hoặc trang admin
      res.redirect('/');
    } else {
      // Đăng nhập thất bại, chuyển hướng tới trang đăng nhập lại hoặc trang lỗi
      res.redirect('/login');
    }
});

// Xử lý các yêu cầu khác

const port = 3000; // Đã khai báo và gán giá trị cho biến port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
