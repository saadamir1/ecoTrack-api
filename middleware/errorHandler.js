const errorHandler = (err, req, res, next) => {
    // console.log(`Incoming Request: ${req.method} ${req.url}`);
    // next();
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
};

module.exports = errorHandler;
