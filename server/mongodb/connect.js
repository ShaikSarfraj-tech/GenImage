import mongoose from "mongoose";

const connectToDB = async (url) => {
    mongoose.set("strictQuery", true);

    mongoose
        .connect(url)
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((error) => {
            console.log(error);
        });
}

export default connectToDB