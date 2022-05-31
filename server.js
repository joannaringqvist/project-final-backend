import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-final";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const PlantSchema = new mongoose.Schema ({
  plantName: {
    type: String,
    required: true,
  },
  plantType: {
    type: String
  },
  indoorOrOutdoor: {
    type: String
  },
  image: {
    type: String
  },
  plantInformation: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const UserSchema = new mongoose.Schema ({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  accesstoken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  },
  email: {
    type: String,
    required: true
  }
})

const Plant = mongoose.model('Plant', PlantSchema);
const User = mongoose.model('User', UserSchema);

app.get('/plants', async (req, res) => {
  const plants = await Plant.find().sort({createdAt: 'desc'}).limit(20).exec();
  res.json(plants);
});

app.get('/plant/:plantId', async (req, res) => {

  const singlePlantId = req.params.plantId;

  const singlePlantById = await Plant.findById(singlePlantId);

  if (!singlePlantById) {
    res.status(404).json("Sorry! Can't find a plant with that name.");
  } else {
    res.status(200).json({
      data: singlePlantById,
      success: true,
    });
  }
});

app.delete("/plant/:plantId", async (req, res) => { 
  const { plantId } = req.params;
  try {
    const deleted = await Plant.findOneAndDelete({_id: plantId});

    if(deleted) {
      res.status(200).json({
        success: true,
        response: deleted
      });
    } else {
      res.status(404).json({
        success: false,
        response: "Not found"
      });
    }

  } catch(error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});

app.patch("/plant/:plantId/updated", async (req, res) => {
  const { plantId } = req.params;
  const { plantName, plantType, indoorOrOutdoor, plantInformation } = req.body;
  console.log(req.params)

  try {
    const PlantToUpdate = await Plant.findByIdAndUpdate({_id: plantId}, {plantName, plantType, indoorOrOutdoor, plantInformation});
    console.log(PlantToUpdate)
    console.log(plantId)
    //console.log(updatedPlant)
    if(PlantToUpdate) {
      res.status(200).json
        ({ response: {plantName, plantType, plantInformation, indoorOrOutdoor}, success: true});
    } else {
      res.status(404).json({
        success: false,
        response: "Not found"
      });
    }

  } catch(error) {
    res.status(400).json({
      success: false,
      response: error
    });
  }
});

app.post('/plants', async (req, res) => {
  const { plantName, plantType, indoorOrOutdoor, image, plantInformation, date } = req.body;
  try {
    const newPlant = new Plant({plantName, plantType, indoorOrOutdoor, image, plantInformation, date});
      await newPlant.save();
      res.status(201).json({
        response: newPlant,
        success: true
      });
    } catch(err) {
      res.status(400).json({
        response: err,
        message: 'Could not save the Plant', 
        errors: err.errors,
        success: false,
        status: 400
      })
    }
});

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
