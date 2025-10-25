import mongoose from "mongoose";

const TodoSchema = mongoose.Schema({
    text : {
        type : String,
        required : true
    },
    completed : {
        type : Boolean,
        default : false
    }
}, {timestamps : true})

export const Todo = mongoose.model("Todo", TodoSchema)
