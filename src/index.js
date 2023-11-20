// require ("dotenv").config({path: './env'})
import dotenv from "dotenv"
import exppess from "express"
import connectDB from "./db/index.js";

const app=exppess()

dotenv.config({
    path: "./env"
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running at port: ${process.eventNames.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGO Connection faield", error);
})










/* ;(async()=>{
    try {
       await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
       app.on("error", (error)=>{
        console.log("Error: ", error);
        throw error
       })

       app.listen(process.env.PORT, ()=>{
        console.log(`App is listining on port ${process.env.PORT}`);
       })

    } catch (error) {
        console.log("Error : ", error);
    }
})() */

