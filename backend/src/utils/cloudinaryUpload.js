const cloudinary =
    require("../config/cloudinary");


/**
 * Upload an image buffer to Cloudinary
 */
const uploadImage = (
    buffer,
    folder = "eduplatform/course-thumbnails"
) => {

    return new Promise(
        (resolve, reject) => {

            const uploadStream =
                cloudinary.uploader.upload_stream(
                    {
                        folder,
                        resource_type: "image"
                    },

                    (error, result) => {

                        if (error) {

                            reject(error);

                            return;

                        }


                        resolve(result);

                    }
                );


            uploadStream.end(
                buffer
            );

        }
    );

};


/**
 * Delete an image from Cloudinary
 */
const deleteImage = (
    publicId
) => {

    if (!publicId) {
        return Promise.resolve();
    }

    return cloudinary.uploader.destroy(
        publicId,
        {
            resource_type: "image"
        }
    );

};


module.exports = {
    uploadImage,
    deleteImage
};