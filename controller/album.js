


import { Album } from '../model/album.model.js'; // Adjust path as needed
import { Song } from '../model/song.js'; // Need this to handle song deletion/removal
import { v2 as cloudinary } from 'cloudinary'; 
import fs from 'fs'; // Node.js built-in file system module

// --- Helper function for Cloudinary Upload ---
// (Assume this function is defined or imported separately, 
// as it was in the previous song controller example)
const uploadToCloudinary = async (filePath, resourceType, folderName) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: resourceType,
            folder: `music-app/${folderName}`
        });
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); 
        }
        return result.secure_url;
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error(`Cloudinary upload failed for ${resourceType}:`, error.message);
        throw new Error('File upload to storage failed.');
    }
};


export const createAlbum = async (req, res) => {
    const { title, artist, releaseYear } = req.body;
console.log(title,artist,releaseYear)
    // 1. Check for required text fields
 //   if (!title || !artist || !releaseYear) {
      //  return res.status(400).json({ message: 'Title, artist, and release year are required.' });
  // }

    // 2. Check for image file (assuming 'image' is the field name)
    if (!req.files || !req.files.image) {
        return res.status(400).json({ message: 'Album cover image is required.' });
    }
    
    const imageFile = req.files.image;
    let imageUrl = null;

    try {
        // 3. Upload image to Cloudinary
        imageUrl = await uploadToCloudinary(imageFile.tempFilePath, 'image', 'album-covers');

        // 4. Create the new Album instance
        const newAlbum = new Album({
            title,
            artist,
            releaseYear: Number(releaseYear),
            imageUrl,
            songs: [], // Start with an empty song list
        });

        // 5. Save the album to the database
        await newAlbum.save();
       
        
        return res.status(201).json(newAlbum);

    } catch (error) {
        console.error('Error creating album:', error.message);
        return res.status(500).json({ 
            message: 'Failed to create album due to server error.', 
            error: error.message 
        });
    }
};

// =================================================================
// 2. GET ALL ALBUMS (GET /api/albums)
// =================================================================

export const getAllAlbums = async (req, res) => {
    try {
        // Find all albums and populate the 'songs' field to show song details
        const albums = await Album.find().populate('songs');
        
        if (!albums || albums.length === 0) {
            return res.status(404).json({ message: 'No albums found.' });
        }
        
        return res.status(200).json(albums);
    } catch (error) {
        console.error('Error fetching albums:', error.message);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
};

// =================================================================
// 3. GET SINGLE ALBUM (GET /api/albums/:id)
// =================================================================

export const getAlbumById = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id).populate('songs');
        
        if (!album) {
            return res.status(404).json({ message: 'Album not found.' });
        }
        
        return res.status(200).json(album);
    } catch (error) {
        console.error('Error fetching album:', error.message);
        // Handle invalid MongoDB ID format
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid Album ID format.' });
        }
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
};

// =================================================================
// 4. UPDATE ALBUM (PUT /api/albums/:id)
// =================================================================
// Note: This example assumes you are NOT changing the image. If you need 
// to change the image, you'd add similar file upload logic as in createAlbum.

export const updateAlbum = async (req, res) => {
    try {
        const { title, artist, releaseYear } = req.body;
        const albumId = req.params.id;
        
        const updatedAlbum = await Album.findByIdAndUpdate(
            albumId, 
            { title, artist, releaseYear: Number(releaseYear) }, 
            { new: true, runValidators: true } // 'new: true' returns the updated doc
        );
        
        if (!updatedAlbum) {
            return res.status(404).json({ message: 'Album not found.' });
        }
        
        return res.status(200).json(updatedAlbum);
    } catch (error) {
        console.error('Error updating album:', error.message);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
};

// =================================================================
// 5. DELETE ALBUM (DELETE /api/albums/:id)
// =================================================================

export const deleteAlbum = async (req, res) => {
    try {
        const albumId = req.params.id;

        // 1. Find the album to see which songs are associated
        const album = await Album.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: 'Album not found.' });
        }

        // 2. OPTIONAL: Delete the associated songs from the database
        //    (You might want to skip this if songs can belong to multiple albums/playlists)
        await Song.deleteMany({ albumId: albumId }); 
        
        // 3. OPTIONAL: Implement logic here to delete the image from Cloudinary
        //    (Requires Cloudinary public_id, which needs to be stored in the Album schema)
        
        // 4. Delete the album itself
        await Album.findByIdAndDelete(albumId);
        
        return res.status(200).json({ message: 'Album and associated songs deleted successfully.' });

    } catch (error) {
        console.error('Error deleting album:', error.message);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
};

















