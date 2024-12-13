// Utility function to wrap a function in Promise or try-catch block

// Wrapping fn in Promise
const asyncHandler = (fn) => (req, res, next) => {

    Promise
        .resolve(fn(req, res, next))
        .catch((err) => next(err));
}

export default asyncHandler






/*

// Wrapping fn in try-catch block
const asyncHandler = (fn) => async (req, res, next) => {

    try {
        await fn(req, res, next);
    }
    catch (err) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message,
        });
    }
}

*/