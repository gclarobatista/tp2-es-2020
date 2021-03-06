import React, { Component } from "react";
import "../style/Results.css";
import { getJwt } from "../utils/Jwt";
import { API_KEY } from "../utils/ApiUtils"
import Axios from "axios";
import { withRouter } from "react-router-dom";

// const driverNames = ['Chefe Abilio Novais', 'Chefe Norberto Carvalhosa', 'Chefe Amílcar Morais', 'Chefe Abel dos Santos']
// const carInfos = ['Nissan Juke, 45-AB-67 ', 'Mercedes, C220 23-55-JZ', 'Skoda Otavia, 82-UB-26', 'Audi A6, 25-HT-12']

var travel = {
    'sourceAddress': '',
    'sourceLatitude': 0,
    'sourceLongitude': 0,
    'destinationAddress': '',
    'destinationLatitude': 0,
    'destinationLongitude': 0,
    'travelDistance': '',
    'price': 0,
    'estimatedTravelTime': 0,
    'driverTotalDistance': 0,
    'driverInitialLatitude': 0,
    'driverInitialLongitude': 0,
}

class Results extends Component {

    constructor(props) {
        super(props)
        this.state = {
            JWT: getJwt(),
            destinations: [],
            desiredLocation: this.props.location.state.location,
            isFetching: true,
            taxiStation: {},
            totalDistance: 0,
        }

        this.getNearestTaxiStation = this.getNearestTaxiStation.bind(this)
        this.getAddressByCoordinates = this.getAddressByCoordinates.bind(this)
        this.getDistanceBetweenTwoLocations = this.getDistanceBetweenTwoLocations.bind(this)
    }
    
    isGeoLocationSupported() {
        if (!navigator.geolocation) {
            alert("[ERRO] O seu browser não suporta geolocalização")
            this.props.history.push("/home")
            return false;
        }
        return true;
    }

    onClickHandler(index) {
        if(!this.isGeoLocationSupported()) { return; }
        
        var geoSuccess = myPosition => {
            travel.sourceLatitude = myPosition.coords.latitude;
            travel.sourceLongitude = myPosition.coords.longitude;
            travel.destinationLatitude = this.state.destinations[index].position.lat;
            travel.destinationLongitude = this.state.destinations[index].position.lng;
            travel.destinationAddress = this.state.destinations[index].title;
            
            this.getNearestTaxiStation()
        };
        navigator.geolocation.getCurrentPosition(geoSuccess);
    }
    
    getNearestTaxiStation() {
        const nearestTaxiHereApiUrl = 'https://discover.search.hereapi.com/v1/discover?at=' + travel.sourceLatitude + ',' + travel.sourceLongitude + '&q=taxis&limit=20&apiKey= ' + API_KEY;
        let options = {
            method: 'GET'
        }

        Axios(nearestTaxiHereApiUrl, options)
        .then((response) => {
            travel.driverInitialLatitude = response.data.items[0].position.lat;
            travel.driverInitialLongitude = response.data.items[0].position.lng;
            this.setState({taxiStation: response.data.items[0]})

            for(let i = 1; i < response.data.items.length; i++) {
                if(response.data.items[i].distance < this.state.taxiStation.distance) {
                    this.setState({taxiStation: response.data.items[i]})                   
                }
            }
            this.setState({totalDistance: this.state.taxiStation.distance})
            this.getDistanceBetweenTwoLocations()
        })
        .catch(() => {
            alert('[ERRO] Não foi possível localizar a estação de taxis mais perto de si')
        })
    }

    getDistanceBetweenTwoLocations() {
        const distanceBetweenTwoLocationsHereApiUrl = 'https://router.hereapi.com/v8/routes?transportMode=car&origin=' + travel.sourceLatitude + ',' + travel.sourceLongitude + '&destination=' + travel.destinationLatitude + ',' + travel.destinationLongitude + '&apikey=' + API_KEY + '&return=travelSummary'
        let options = {
            method: 'GET'
        }
        Axios(distanceBetweenTwoLocationsHereApiUrl, options)
        .then((response) => {
            travel.travelDistance = response.data.routes[0].sections[0].travelSummary.length;
            travel.estimatedTravelTime = response.data.routes[0].sections[0].travelSummary.duration
            travel.driverTotalDistance = this.state.totalDistance;
            travel.price = Math.round((travel.driverTotalDistance / 1000) * 10) / 10;
            
            this.setState({totalDistance: this.state.totalDistance + travel.travelDistance})
            this.getAddressByCoordinates();
        })
        .catch(() => {
            alert("[ERRO] Não foi possível calcular um itenerário para o seu destino pretendido")
        })
    }


    getAddressByCoordinates() {
        const addressByCoordinatesHereApiUrl = 'https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?prox=' + travel.sourceLatitude + ',' + travel.sourceLongitude + ',' + '250&mode=retrieveAddresses&maxresults=1&gen=9&apiKey=' + API_KEY;
        let options = {
            method: 'GET'
        }

        Axios(addressByCoordinatesHereApiUrl, options)
        .then( response => {
            travel.sourceAddress = response.data.Response.View[0].Result[0].Location.Address.Label;
            this.props.history.push({
                pathname: "/confirmTrip",
                state: { 'travel': travel }
            })
        })
        .catch(() => {
            alert("[ERRO] Não foi possível localizar o endereço através das suas coordenadas")
        })  
    }

    componentDidMount() {
        const matchLocationsHereApiUrl = 'https://geocode.search.hereapi.com/v1/geocode?q=' + this.state.desiredLocation +'&apiKey=' + API_KEY
        let options = {
            method: 'GET'
        }
        
        Axios(matchLocationsHereApiUrl, options)
        .then(response => {            
            this.setState({destinations: response.data.items, isFetching: false})
        })
        .catch(() => {
           alert('[ERRO] Não foi possível localizar nenhum destino correspondente à sua procura')
        })
    }

    render() {
        let splittedAddress = [];
        return (
            <div className="destinations-container">
                {!this.state.isFetching ? 
                    this.state.destinations.length ?
                    <ul className="destinations-list-options">
                        <h4>Escolha o seu destino:</h4>
                        {this.state.destinations.map((destination, index) => {
                            return[
                                <div key={index} className="destinations-option-container" onClick={() => this.onClickHandler(index)}>
                                    <p><b>{splittedAddress = destination.title.split(",")[0]}</b></p>
                                    <p>{splittedAddress = destination.title.split(",")[1]}</p>
                                    <p>{splittedAddress = destination.title.split(",")[2]}</p>
                                </div>
                            ]
                        })}
                    </ul>
                    : 
                    <>
                        <h1>Não foi possível identificar um local</h1>
                        <button id="button" onClick={() => this.props.history.push("/transcription")}>Tentar de Novo</button>
                    </>
                : 
                <div className="loading-spin-container">
                    <i className="fa fa-circle-o-notch fa-spin"></i>
                    <p>Localizando o seu local...</p>
                </div>
                }                
            </div>
        )
    }
}

export default withRouter(Results);