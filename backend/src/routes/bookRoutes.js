import express from "express";
import Book from "../models/Book.js";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
   try{
    const { title, image, caption, rating, } = req.body;
    if(!title || !image || !caption || !rating){
        return res.status(400).json({message: "Please fill in all fields"});
    }
    const uploadResponse = await cloudinary.uploader.upload(image, {
        upload_preset: "bookshelf",

    });
    const imageUrl = uploadResponse.secure_url;
    const newBook = new Book({
        title,
        caption,
        image: imageUrl,
        rating,
        User: req.user._id,
    });
    await newBook.save();
    res.status(201).json(newBook);
     
   }
   catch{
    res.status(201).json({message: "Book added successfully"});
   }
});

router.get("/", protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("User", "username profileImage");
        const totalBooks = await Book.countDocuments();
        res.send({
            books, 
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }

});

router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ User: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});




router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (book.User.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // Delete image from cloudinary
        if(book.image && book.image.includes("cloudinary")){
            const publicId = book.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }


        await book.deleteOne();
        res.json({ message: "Book removed" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
