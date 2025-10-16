const mongoose = require('mongoose');

const connect = async (req, res) => {
    try {
        await mongoose.connect(
            `mongodb+srv://danhkiet:danhkiet@cluster0.meug8ms.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
        );
        console.log('Connect database successfully!');
    } catch (error) {
        console.log(error);
    }
};

module.exports = connect;