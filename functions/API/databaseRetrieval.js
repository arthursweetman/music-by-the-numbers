let admin = require("firebase-admin");
const db = require("../db/db").db;
const express = require("express");
const app = express();
const cors = require("cors")({
  origin: true,
});
app.use(cors);

app.post("/getDailyMusicianData", async (req, res) => {
    let musician = req.body.musician || req.query.musician || null;
    if (!musician) res.status(412).send("Missing Musician");
    await db
      .collection("musicians").doc(musician).collection("DATA")
      .get()
      .then(snapshot => {
        const data = [];
        snapshot.forEach(doc => {
          data.push((doc.id, '=>', doc.data()));
        });
        return res.status(200).send(data);
      })
    .catch(err => {
      res.status(400).send('Error getting documents', err);
    });
    
});

app.post("/getRequestData", async (req, res) => {
  let musician = req.body.musician || req.query.musician || null;
  if (!musician) res.status(412).send("Missing Musician");
  await db
    .collection("musicians").doc(musician).collection("REQUEST_DATA")
    .get()
    .then(snapshot => {
      const data = [];
      snapshot.forEach(doc => {
        data.push((doc.id, '=>', doc.data()));
      });
      return res.status(200).send(data);
    })
  .catch(err => {
    res.status(400).send('Error getting documents', err);
  });
});

app.post("/getDiscoverabilityData", async (req, res) => {
  let musician = req.body.musician || req.query.musician || null;
  if (!musician) res.status(412).send("Missing Musician");
  await db
    .collection("musicians").doc(musician).collection("discoverability")
    .get()
    .then(snapshot => {
      const data = [];
      snapshot.forEach(doc => {
        data.push((doc.id, '=>', doc.data()));
      });
      return res.status(200).send(data);
    })
  .catch(err => {
    res.status(400).send('Error getting documents', err);
  });
});

app.post("/getFanData", async (req, res) => {
  let musician = req.body.musician || req.query.musician || null;
  if (!musician) res.status(412).send("Missing Musician");
  await db
    .collection("musicians").doc(musician).collection("FAN_DATA")
    .get()
    .then(snapshot => {
      const data = [];
      snapshot.forEach(doc => {
        data.push((doc.id, '=>', doc.data()));
      });
      return res.status(200).send(data);
    })
  .catch(err => {
    res.status(400).send('Error getting documents', err);
  });
})

module.exports = {
  app,
};
