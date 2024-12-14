import multer from "multer"

// storing files in disk (DiskStorage) (we can also use MemoryStorage, but beter to use DiskStorage)
const storage = multer.diskStorage({

    // There are two options available, destination and filename. They are both functions that determine where the file should be stored.
    // cb is callBack function
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({ storage })