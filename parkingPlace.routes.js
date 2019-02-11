module.exports = (app) => {
    const parkinPlaces = require('./parkingPlaceControllers');

    app.post('/v1/register/parking-place', parkinPlaces.signUp);

    app.post('/v1/parking-place/:parkingPlaceIdentifier/delete', parkinPlaces.delete);

    app.post('/v1/parking-place/:parkingPlaceIdentifier/modify', parkinPlaces.modify);




    //     app.get('/v1/parking-houses', parkingHouses.findAll);

}