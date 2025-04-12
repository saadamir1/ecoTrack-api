
const errorHandler = (err, req, res, next) => {
    //jwt authentication error
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message || 'Validation Error', });
    }
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'The user is not authorized' });
    }
    console.error('Error:', err.message, err);

    return res.status(500).json({ message: err.message }) //default 
};

module.exports = errorHandler;
