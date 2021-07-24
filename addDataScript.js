const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Data = require("./models/dataModel")
const fs = require("fs");
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

  var data_str = fs.readFileSync('./data.json' , 'utf-8');
  var data = JSON.parse(data_str);
console.log(data.reit)

const EnterData = await Data.create({
    reitData : data.reit
});
