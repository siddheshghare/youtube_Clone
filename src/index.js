import dotenv from "dotenv"


import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})



connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("server is running on port:",process.env.PORT);
        
    })
})
.catch((err)=>{
    console.log("DB connection error:",err);
    

})






/*
import express from "express"
const app=express();

;( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("error:",error);
            throw err
        })
        app.listen(process.env.port,()=>{
            console.log("app is ;istoning on port",process.env.port);
            
        })
        
    } catch (error) {
        console.error("ERROR:", error);
        throw err
        
    }
})()
    */
