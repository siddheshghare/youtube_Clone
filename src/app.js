import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"



const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN , 
    credentials: true }));



app.use(express.json());

app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

//routes import 
//import userRouter from "./routes/user.router.js";
import userRouter from "./routes/user.routes.js"

import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import playlistRouter from "./routes/playlist.route.js"

app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/like",likeRouter)
app.use("/Api/v1/comment",commentRouter)
app.use("/Api/v1/users",userRouter)
app.use("/Api/v1/playlist",playlistRouter)
app.use("/Api/v1/users",videoRouter)
//http://localhost:8000/api/v1/users/register  link will look like this



 export {app};