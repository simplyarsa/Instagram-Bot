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
        generateImage2()
        postToInsta()
        console.log(error)
    }
}

const generateImage = async () => {
    let nasaUrl = `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    try {
        const res = await axios.get(nasaUrl)
        imageUrl = res.data.hdurl
        // imgCaption = `${res.data.title} \n\n ${res.data.explanation}`
        imgCaption = `${res.data.title} \t${res.data.date} \n\n${res.data.explanation}`
        console.log(imageUrl)
    } catch (err) {
        console.log(err)
    }
}

const generateImage2 = async () => {
    let nasaUrl = `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&count=3`
    try {
        const res = await axios.get(nasaUrl)
        imageUrl = res.data[0].hdurl
        imgCaption = `${res.data[0].title} \t${res.data[0].date} \n\n${res.data[0].explanation}`
        console.log(imageUrl)
    } catch (err) {
        const res = await axios.get(nasaUrl)
        imageUrl = res.data[1].hdurl
        imgCaption = `${res.data[1].title} \t${res.data[1].date} \n\n${res.data[1].explanation}`
        console.log(imageUrl)
        console.log(err)
    }
}

const cronInsta = new CronJob("0 0 14 * * *", async () => {
    console.log("Post to insta")
    await generateImage();
    await postToInsta();
});

const ping = async () => {
    try {
        const res = await axios.get("https://instagram-bot-4p8o.onrender.com")
        //   const res = await axios.get("http://localhost:4000/")
    } catch (err) {
        console.log(err)
    }
}

setInterval(ping, 600000)

app.get("/", (req, res) => {
    console.log("Pinged")
    res.send("google-site-verification: google6832c48cf04c3941.html");
})

app.get("/time", (req, res) => {
    let d = new Date()
    let h = d.getHours()
    let m = d.getMinutes()
    console.log(h, m)
    res.send(`Time is ${h} ${m}`);
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

cronInsta.start();

const run =async()=>{
   await generateImage()
    await postToInsta()
}

run()


