import mongoose from "mongoose";

export const connection = () => {   
    mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "bookworm",
    })
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log("Database connection failed");
      console.error(err);
    });
};
