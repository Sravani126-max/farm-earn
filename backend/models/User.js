import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^\d{10}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid 10-digit phone number!`,
            },
        },
        aadhar: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^\d{12}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid 12-digit Aadhar number!`,
            },
        },
        password: {
            type: String,
            required: function() { return !this.firebaseUid; },
            minlength: 6,
            select: false,
        },
        firebaseUid: {
            type: String,
            unique: true,
            sparse: true,
        },
        role: {
            type: String,
            enum: ['Farmer', 'Buyer', 'Agent', 'Admin'],
            required: true,
        },
        location: {
            type: String,
            required: [true, 'Please add a location'],
        },
        locationCoordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },
        profileImage: {
            type: String,
            default: 'no-photo.jpg',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        interests: {
            type: [String],
            default: []
        },
        isBlocked: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

// Add 2dsphere index for locationCoordinates
userSchema.index({ locationCoordinates: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
