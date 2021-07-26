const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Data = require('../models/dataModel');
const ProductList = require('../models/productListModel');
const fs = require('fs');
dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connection to Database is successful!'));

const productList = JSON.parse(
  fs.readFileSync(`${__dirname}/productList.json`, 'utf-8')
);

const data_str = fs.readFileSync(`${__dirname}/data.json`, 'utf-8');
const data = JSON.parse(data_str);

const importData = async () => {
  try {
    await Data.create(data);
    console.log('Data Added successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Data.deleteMany();
    console.log('Data Deleted Successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const importProductList = async () => {
  try {
    await ProductList.create(productList);
    console.log('Product List imported successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteProductList = async () => {
  try {
    await ProductList.deleteMany();
    console.log('Product List deleted Successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  if (process.argv[3] === '--productList') {
    importProductList();
  } else if (process.argv[3] === '--data') {
    importData();
  }
} else if (process.argv[2] === '--delete') {
  if (process.argv[3] === '--productList') {
    deleteProductList();
  } else if (process.argv[3] === '--data') {
    deleteData();
  }
}
