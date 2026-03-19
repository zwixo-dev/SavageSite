import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from 'cheerio';
import {GoogleGenAI} from '@google/genai';

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static("public"));

dotenv.config({ path: './.env' })


app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/analyze", (req,res) => {
    res.render("analyze.ejs", { 
        isWrong: false,
        websiteName : "",
        metaDescription:"",
        titles:"",
        imgs:""
    });
});

app.post("/analyze", async (req,res) => {
    const {url} = req.body;
    try {
        if (!url) {
            console.log("url not found");
            return res.render("analyze.ejs", {
                isWrong :true,
                websiteName : "",
                metaDescription:"",
                titles:"",
                imgs:""
            });
        }

        const response = await axios.get(url);
        const $ =  cheerio.load(response.data);
        
        const getWebsiteName = websiteName($);
        const metaDescription = analyzeMetaDesciption($);
        const getTitles = analyzeTheTitles($);
        const getImages = analyzeImages($);
        const getLinks = analyzeLinks($);

        return res.render("analyze.ejs", { 
            isWrong: false,
            websiteName : getWebsiteName  || "WebSite Name Not Found !",
            metaDescription:metaDescription || " Meta Description Not Found !",
            titles: getTitles || "Titles Not Found !",
            imgs: getImages || "Can Not access any image"
        });

    } catch (error) {
        console.log(error.message);
        res.status(400).json({
            message: error.message
        });
    }
});



function websiteName($){
    const title = $("title").text();
    if(title){
        return title;
    }
    return false;
}

function analyzeMetaDesciption($) {
    const getMetaDescription = $('meta[name="description"]').attr("content");

    if (getMetaDescription) {
        return getMetaDescription;
    } 

    return false; 
}

function analyzeTheTitles($){
    const titles =[];
        $("h1,h2,h3,h4,h5,h6").each((index, element) => {
            if(element){
                titles.push($(element).text().trim());
            }
    });
    if(titles.length === 0){
        return false;
    }

    return titles;
}


function analyzeImages($){
    const images = [];
        $("img").each((index, img) => {
            let src =  $(img).attr("src");
            if(src){
                images.push(src);
            }
        })

    if(images.length === 0){
        return false;
    }
    return images;
}


function analyzeLinks($){
    const links = [];
    $("a").each((index, href) => {
        let link = $(href).attr("href");
        if(link){
            links.push(link);
        }
    })

    if(links.length === 0){
        return false;
    }
    return links;
}

// function analyzeFonts(){
//     // const fonts = [];
//     // const getFonts;
// }

// Gemini 
console.log(process.env.GEMINI_API_KEY);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function main() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Why is the sky blue?',
  });
  console.log(response.text);
}

// main();

export default app;