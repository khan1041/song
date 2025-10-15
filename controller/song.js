

import { Song } from '../model/song.js'; // Adjust path to your Song model
import { v2 as cloudinary } from 'cloudinary'; 
import fs from 'fs'; // For file system operations (deleting temp files)
import { Album } from '../model/album.model.js';
import User from '../model/user.js';

// --- Helper function to upload files and delete temp files ---
const uploadToCloudinary = async (filePath, resourceType, folderName) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: resourceType, // 'image', 'video', or 'raw'
            folder: `music-app/${folderName}` // Customize your Cloudinary folder
        });
        
        // Cleanup the temporary file created by express-fileupload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); 
        }
        return result.secure_url;
    } catch (error) {
        // Cleanup on failure
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error(`Cloudinary upload failed for ${resourceType}:`, error.message);
        throw new Error('File upload to storage failed.');
    }
};



export const createSong = async (req, res) => {
    // 1. Destructure data from body and check for files in req.files 
    const { title, artist, duration, albumId } = req.body;
  console.log(title,artist,duration,albumId)
    // Check if both files were uploaded via the file upload middleware (express-fileupload)
    if (!req.files || !req.files.image || !req.files.audio) {
        return res.status(400).json({ 
            message: 'Both an image file ("image") and an audio file ("audio") are required.' 
        });
    }

    // Assign file objects (assuming 'image' and 'audio' are the field names in the form)
    const imageFile = req.files.image;
    const audioFile = req.files.audio;

    // 2. Validate essential text fields
    if (!title || !artist || !duration) {
        // Since we are returning here, we should clean up the temp files if they exist
        if (fs.existsSync(imageFile.tempFilePath)) fs.unlinkSync(imageFile.tempFilePath);
        if (fs.existsSync(audioFile.tempFilePath)) fs.unlinkSync(audioFile.tempFilePath);

        return res.status(400).json({ 
            message: 'Title, artist, and duration are required text fields.' 
        });
    }

    try {
        // 3. Upload files to Cloudinary
        const imageUrl = await uploadToCloudinary(imageFile.tempFilePath, 'image', 'song-images');
        const audioUrl = await uploadToCloudinary(audioFile.tempFilePath, 'video', 'song-audio'); 

        // 4. Create and save the new Song document
        const newSong = new Song({
            title,
            artist,
            duration: Number(duration), // Ensure duration is a number
            imageUrl,
            audioUrl,
            albumId: albumId || null,
        });

        await newSong.save();
        if(albumId){
            await Album.findByIdAndUpdate(albumId,{
                $push:{songs:newSong._id}
            })
        }
        // 5. Success Response
        return res.status(201).json({
            message: 'Song created successfully with Cloudinary uploads.',
            song: newSong,
        });

    } catch (error) {
        // 6. Handle errors (database or Cloudinary upload)
        console.error('Error in createSong:', error.message);
        return res.status(500).json({ 
            message: 'Internal Server Error while creating the song.',
            error: error.message
        });
    }
};

//get all song

export const getAllsong=async(req,res)=>{

    try {
        const songs=await Song.find()
        res.json(songs)
        
    } catch (error) {
        console.log(error)
    }}


//singale song


export const getSingaleId=async (req,res)=>{

try {
    const {id}=req.params

    const song=await Song.findById(id)

    if(!song){
    return res.status(200).json({msg:'song not found'})
    }
  
  return res.status(200).json(song)
} catch (error) {
    console.log(error)
}}


//


export const songdeleteId=async (req,res)=>{
try {
const {id}=req.params
 const song=await Song.findByIdAndDelete(id)
 if(!song){
 return res.status(200).json({msg:'song not found'})
 }

 return res.status(200).json(song)
} catch (error) {
 console.log(error)
}}


//update data()

export const updateData=async(req,res)=>{

 try {
        const { id } = req.params;
        const updateData = req.body; 

        const updatedSong = await Song.findByIdAndUpdate(
            id,             
            updateData,     
            { 
                new: true,         
                runValidators: true 
            }
        );

        if (!updatedSong) {
            return res.status(404).json({ 
                success: false, 
                message: 'Song not found with the given ID.' 
            });
        }

        return res.status(200).json({
            success: true,
            message: "Song updated successfully.",
            data: updatedSong 
        });

    } catch (error) {
        console.error("Error during song update:", error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            
            return res.status(400).json({ 
                success: false, 
                message: `Validation failed: ${messages.join(', ')}`,
                details: messages
            });
        }
        
        if (error.name === 'CastError') {
             return res.status(400).json({ 
                success: false, 
                message: "Invalid song ID format."
            })

} }}


export const addSaveMark = async (req, res) => {
    const userId = req.user.id;
    const songId = req.params.id; // Correct variable name for clarity

    try {
        // 1. Validate Song existence
        const songExists = await Song.findById(songId);
        if (!songExists) {
            // Use 404 Not Found since the resource (song) doesn't exist
            return res.status(404).json({ success: false, message: "Song not found." });
        }

        // 2. Atomically update the User document
        // $addToSet ensures songId is only added if it is NOT already present, 
        // satisfying the "save only one time" requirement.
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { saveMark: songId } },
            { new: true, runValidators: true }
        ).select('saveMark'); // Only return the updated saveMark array

        await Song.findByIdAndUpdate(
            songId,
            // Again, use $addToSet to ensure the userId is only recorded once per song.
            { $addToSet: {isSved:userId } }, 
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Song successfully saved (or already saved).",
            // Send the latest, deduplicated array back to the frontend
            data: updatedUser.saveMark,
        });

    } catch (error) {
        console.error("Error saving song:", error); 
        res.status(500).json({
            success: false,
            message: "An internal server error occurred while saving the song.",
            error: error.message
        });
    }
};



export const removeSaveMark = async (req, res) => {
    // 1. Get user and song IDs
     const userId = req.user.id;
    const songId = req.params.id; // Correct variable name for clarity

    try {
        // 1. Validate Song existence
        const songExists = await Song.findById(songId);
        if (!songExists) {
            // Use 404 Not Found since the resource (song) doesn't exist
            return res.status(404).json({ success: false, message: "Song not found." });
        }

       
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { saveMark: songId } },
            { new: true, runValidators: true }
        ).select('saveMark'); // Only return the updated saveMark array

        await Song.findByIdAndUpdate(
            songId,
            // Again, use $addToSet to ensure the userId is only recorded once per song.
            { $pull: {isSved:userId } }, 
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Song successfully saved (or already saved).",
            // Send the latest, deduplicated array back to the frontend
            data: updatedUser.saveMark,
        });

    } catch (error) {
        console.error("Error saving song:", error); 
        res.status(500).json({
            success: false,
            message: "An internal server error occurred while saving the song.",
            error: error.message
        });
    }
};


