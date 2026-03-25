import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from 'cheerio';
import {GoogleGenAI} from '@google/genai';
import fs from 'fs';



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
        imgs:"",
        links:"", 
        fonts:""
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
                imgs:"",
                links:"",
                 fonts:""
            });
        }

        const response = await axios.get(url);
        const $ =  cheerio.load(response.data);
        
        const getWebsiteName = websiteName($);
        console.log(getWebsiteName);
        const metaDescription = analyzeMetaDesciption($);
        console.log(metaDescription);
        const getTitles = analyzeTheTitles($);
        console.log(getTitles);
        const getImages = analyzeImages($);
        console.log(getImages);
        const getLinks = analyzeLinks($);
        console.log(getLinks);
        const getfonts = fontFamily($);
        console.log(getfonts);

        botScript(getWebsiteName, metaDescription, getTitles, getfonts);

        return res.render("analyze.ejs", { 
            isWrong: false,
            websiteName : getWebsiteName  || "WebSite Name Not Found !",
            metaDescription:metaDescription || " Meta Description Not Found !",
            titles: getTitles || "Titles Not Found !",
            imgs: getImages || "Can Not access any image !",
            links: getLinks || "No Link or Route Found !",
            fonts : getfonts || "No Link or file Fonts Found !",
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
    return null;
}

function analyzeMetaDesciption($) {
    const getMetaDescription = $('meta[name="description"]').attr("content");

    if (getMetaDescription) {
        return getMetaDescription;
    } 

    return null; 
}

function analyzeTheTitles($){
    const titles =[];
        $("h1,h2,h3,h4,h5,h6").each((index, element) => {
            if(element){
                titles.push($(element).text().trim());
            }
    });
    if(titles.length === 0){
        return null;
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
        return null;
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
        return null;
    }

    return links;
}


function fontFamily($){
    const fonts = [];
    $('link[rel="stylesheet"]').each((index, element) => {
        const href = $(element).attr("href");
        if(href){
            fonts.push(href);
        }
    });

    if(fonts.length === 0){
        return null;
    }

    return fonts;
}


console.log(process.env.GEMINI_API_KEY);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function main(data, getWebsiteName, metaDescription, getTitles, getfonts) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${data} ${getWebsiteName} ${metaDescription} ${getTitles} ${getfonts}`,
  });
  console.log(response.text);
}


function botScript(getWebsiteName, metaDescription, getTitles, getfonts){
    fs.readFile('./botScript.txt', 'utf8', async (err, data) => {
        if(err){
            console.log(err);
        }else{
            console.log(data);
            await main(data, getWebsiteName, metaDescription, getTitles, getfonts);
        }
    });
}


export default app;