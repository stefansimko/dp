module.exports = (app) => {
    const parkingHouses = require('./parkingHouseControllers');

    app.post('/v1/register/parking-house', parkingHouses.signUp);

    app.post('/v1/parking-house/:parkingHouseIdentifier/delete', parkingHouses.delete);

    app.post('/v1/parking-house/:parkingHouseIdentifier/modify', parkingHouses.modify);

    app.get('/v1/parking-houses', parkingHouses.findAll);

    app.get('/v1/free-parking-places', parkingHouses.freeParkingPlaces)
}