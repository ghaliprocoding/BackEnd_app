require("dotenv").config({ path: '.env' });
const express = require('express');
const cors = require("cors");

const dbConnect = require("./app/config/db_connect");
const errorHandler = require("./app/middleware/errorMiddlware");

dbConnect();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// JOBS
app.use("/api/jobs", require("./app/routes/job"));
app.use("/jobs", express.static('./app/assets/jobs'));

// USERS
app.use("/api/users", require("./app/routes/user"));
app.use("/users", express.static('./app/assets/users'));


app.use(errorHandler);
app.listen(port, () => console.log(`Server has started on ${port}`));
