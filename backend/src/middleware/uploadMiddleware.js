const multer =
    require("multer");


// Store uploaded image temporarily
// in memory before sending to Cloudinary
const storage =
    multer.memoryStorage();


// Allow only common image formats
const fileFilter =
    (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(null, true);

        }

        else {

            cb(
                new Error(
                    "Only JPG, PNG, and WEBP images are allowed."
                ),
                false
            );

        }

    };


const upload =
    multer({

        storage,

        fileFilter,

        limits: {

            // Maximum thumbnail size:
            // 5 MB
            fileSize:
                5 * 1024 * 1024

        }

    });


module.exports =
    upload;