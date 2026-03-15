import express from "express";
import dotenv from "dotenv";
import * as cheerio from 'cheerio';

const app = express();

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static("public"));

dotenv.config({ path: './.env' })



app.get('/', (req, res) => {
  res.render("home.ejs");
});




export default app;