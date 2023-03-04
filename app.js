require("dotenv").config();
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');
const { Configuration, OpenAIApi } = require('openai');
const CronJob = require("cron").CronJob;
const express = require('express')

const app = express()
const port = process.env.PORT || 4000;

let imageUrl;

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

let url="https://steamuserimages-a.akamaihd.net/ugc/946207409564266728/20911D7B80D93D259083DE2AB505A2D85C06F14D/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false"


const postToInsta = async (imageUrl) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(process.env.IG_USERNAME);
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

    const imageBuffer = await get({
        url: imageUrl,
        encoding: null
    });

    await ig.publish.photo({
        file: imageBuffer,
        caption: 'Really nice photo from the internet!',
    });
}

// postToInsta(url)

const cronInsta = new CronJob("0 39 16 * * *", async () => {
    postToInsta(url);
    console.log("done")
});

cronInsta.start();

// generateImage()
// postToInsta();

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })