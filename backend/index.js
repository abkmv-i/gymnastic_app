const express = require("express");
const cors = require("cors");
//const userRouter = require('./routers/userRouter')
const authRouter = require('./routers/authRouter')
const dataRouter = require('./routers/dataRouter')

const PORT = process.env.PORT || 8080
const app = express()
app.use(cors()); // Middleware для обработки CORS
app.use(express.json());
//app.use('/api', userRouter);
app.use("/auth", authRouter);
app.use("/", dataRouter);
app.listen(PORT, () => console.log(`server started on post ${PORT} `));








