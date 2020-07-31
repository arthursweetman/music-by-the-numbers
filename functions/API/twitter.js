var axios = require('axios');
const express = require("express");
const app = express();
const cors = require("cors")({
  origin: true,
});
app.use(cors);

app.post('/getTwitterData', async (req, res) => {
    let twitterHandle = req.body.twitterHandle || req.query.twitterHandle || null;
    let artist = req.body.artist || req.query.artist || null;
    const url = 'https://alexa4musicians.com/get-started/'+artist.split(" ").join("%20")+'/twitter';
    const bearer_token = '';//Your bearer token

    var config = {
        method: 'get',
        url: 'https://api.twitter.com/1.1/tweets/search/fullarchive/dev.json?query=from:'+twitterHandle.substring(1)+'%20url:"'+url+'"&fromDate=201701010000&maxResults=100',
        headers: { 
          'Authorization': 'Bearer ' + bearer_token, 
        }
      };
      
    await axios(config)
    .then(function (response) {
        res.status(200).json(response.data);
    })
    .catch(function (error) {
        res.status(412).send(error);
    });
});

module.exports = {app,};  