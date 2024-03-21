const Education = require("../models/Education")

const function1=async()=>{
   const resp=await Education.find().limit(10);
   console.log(resp);

}

function1()