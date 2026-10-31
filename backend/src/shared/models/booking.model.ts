import { Schema, model } from "mongoose";
import type { IBooking } from "../interfaces/IBooking.js";

const subEventSchema = new Schema(
  {
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const deliverabkesSchema = new Schema(
 { name:{
    type:String,
    required:true,
  },
  count:{
    type:Number,
    required:true,
  },}
)

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    photographerId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },
    events: {
      type: [subEventSchema],
      required: true,
      validate: [
        (val: unknown[]) => val && val.length > 0,
        "At least one event is required",
      ],
    },
    deliverables:{
      type:[deliverabkesSchema]
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ photographerId: 1, "events.eventDate": 1, status: 1 });

const Booking = model<IBooking>("Booking", bookingSchema);
export default Booking;
