module.exports = (app) => {
    const parkinPlaces = require('./parkingPlaceControllers');
    const login = require('./middleware/login')


    app.post('/v1/register/parking-place', login, parkinPlaces.signUp);

    app.post('/v1/parking-place/:parking-place-identifier/delete', login, parkinPlaces.delete);

    app.post('/v1/parking-place/:parking-place-identifier/modify', login, parkinPlaces.modify);

    app.get('/v1/parking-place/:parking-place-identifier', login, parkinPlaces.getAvailability)

    //     app.get('/v1/parking-houses', parkingHouses.findAll);

}