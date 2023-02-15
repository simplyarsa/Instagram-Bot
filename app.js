require("dotenv").config();
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');
const { Configuration, OpenAIApi } = require('openai');

let imageUrl;

const configuration = new Configuration({
    apiKey: process.env.API_KEY
})

const openai = new OpenAIApi(configuration)

const generateImage = async () => {

    const response = await openai.createImage({
        prompt: "Spaceman",
        n: 1,
        size: "256x256",
    })
    imageUrl = response.data.data[0].url;

    console.log(imageUrl)
    postToInsta(imageUrl)
    return response.data.data[0].url
}


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

generateImage()
// postToInsta();