import app from "./analyzer.js";

const port = 3000;


app.listen(port || 5000 , ()=>{
        console.log("i'm listen to the pisrt", port);
});     