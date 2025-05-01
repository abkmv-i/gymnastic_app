const express = require("express");
const cors = require("cors");

const authRouter = require('./routers/authRouter');
const dataRouter = require('./routers/dataRouter');
const competitionRouter = require('./routers/competitionRouter');
const gymnastRouter = require('./routers/gymnastRouter');

const PORT = process.env.PORT || 8080;
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ← обязательно

app.use(express.json());

app.use("/auth", authRouter);
app.use("/", dataRouter);
app.use("/competitions", competitionRouter);
app.use("/gymnasts", gymnastRouter);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
