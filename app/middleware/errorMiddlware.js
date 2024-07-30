const errorHandler = (err, req, res, next) => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
        success: false,
        message: errMsg,
        status: errStatus,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })
}

module.exports = errorHandler;
