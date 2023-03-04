require("dotenv").config();
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');
const { Configuration, OpenAIApi } = require('openai');
const CronJob = require("cron").CronJob;
const express = require('express');
const { default: axios } = require("axios");
// const axios=require('axios')

const app = express()
const port = process.env.PORT || 4000;

console.log("Started")

let imageUrl;
let imgCaption;

const configuration = new Configuration({
    apiKey: process.env.API_KEY
})

const openai = new OpenAIApi(configuration)

// const generateImage = async () => {

//     const response = await openai.createImage({
//         prompt: "black cat reading a book",
//         n: 1,
//         // size: "256x256",
//         size: "1024x1024",
//     })
//     imageUrl = response.data.data[0].url;

//     console.log(imageUrl)
//     postToInsta(imageUrl)
//     return response.data.data[0].url
// }

// let url = "https://steamuserimages-a.akamaihd.net/ugc/946207409564266728/20911D7B80D93D259083DE2AB505A2D85C06F14D/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false"


const postToInsta = async () => {
    try {
        console.log("Inside function")
        const ig = new IgApiClient();
        ig.state.generateDevice(process.env.IG_USERNAME);
        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

        const imageBuffer = await get({
            url: imageUrl,
            encoding: null
        });

        await ig.publish.photo({
            file: imageBuffer,
            caption: imgCaption,
        });
    } catch (error) {
        console.log(error)
    }
}

const generateImage = async () => {
    let nasaUrl = `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    try {
        const res = await axios.get(nasaUrl)
        imageUrl = res.data.url
        imgCaption = res.data.title
        console.log(imageUrl, imgCaption)
    } catch (err) {
        console.log(err)
    }
}


const cronInsta = new CronJob("0 */30 * * * *", async () => {
    console.log("Post to insta")
    generateImage();
    postToInsta();
});

cronInsta.start();

// app.get("/", (req, res) => {
//     res.send("Hello from backend")
// })

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

// generateImage()
// postToInsta()
