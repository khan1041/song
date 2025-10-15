

import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		artist: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		audioUrl: {
			type: String,
			required: true,
		},
		duration: {
			type: Number,
			required: true,
		},
	 isSved:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],

	 isSaved: {
      type: Boolean,
      default: false,
    },
	},
	{ timestamps: true }
);

export const Song = mongoose.model("Song", songSchema);










