// Import dependencies
import mongoose, { Schema } from "mongoose"; // Mongoose & Schema for defining model
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Plugin for pagination on aggregate queries

// Define schema for Video collection
const videoSchema = new Schema(
    {
        videoFile: {
            type: String,   // Cloudinary URL (video stored in cloud)
            required: true  // must be provided
        },
        thumbnail: {
            type: String,   // Thumbnail image URL
            required: true
        },
        title: {
            type: String,   // Title of the video
            required: true
        },
        description: {
            type: String,   // Description of the video
            required: true
        },
        duration: {
            type: Number,   // Length of video in seconds (fetched from Cloudinary or metadata)
            required: true
        },
        views: {
            type: Number,   // Number of times video has been viewed
            default: 0      // starts from 0
        },
        isPublished: {
            type: Boolean,  // Whether video is visible to public
            default: true   // by default, published
        },
        owner: {
            type: Schema.Types.ObjectId, // Reference to User collection
            ref: "User"                  // creates relationship between Video → User
        }
    },
    {
        timestamps: true // Automatically adds createdAt & updatedAt fields
    }
);

// Add aggregate pagination plugin to schema
// → lets you use pagination with aggregate pipelines (e.g. filtering, lookup, sorting)
videoSchema.plugin(mongooseAggregatePaginate);

// Export Video model to use in app
export const Video = mongoose.model("Video", videoSchema);
