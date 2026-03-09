import mongoose from "mongoose";

const providerSceheduleSchema = new mongoose.Schema(
    {
        providerProfileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProviderProfile",
            required: true
        },

        availability: [
            {
                day: {
                    type: String,
                    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    required: true
                },
                startTime: {
                    type: String,
                    required: true,

                    validate: {
                        validator: function(v) {
                            return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(v);
                        },
                        message: props => `${props.value} is not a valid time format! Use HH:MM in 24-hour format.`
                    },
                },
                endTime: {
                    type: String,
                    required: true,
                    validate: {
                        validator: function(v) {
                            return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(v);
                        },
                        message: props => `${props.value} is not a valid time format! Use HH:MM in 24-hour format.`
                    },
                },
         
            },
        ]    
    },
    { timestamps: true }
);

providerSceheduleSchema.index({ providerProfileId: 1 });

const ProviderSchedule = mongoose.model("ProviderSchedule", providerSceheduleSchema);

export default ProviderSchedule;
