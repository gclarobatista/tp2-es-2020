import React, { Component } from "react";
import "../style/TrackTrip.css";
import { getJwt } from "../utils/Jwt";
import Axios from "axios";
import { withRouter } from "react-router-dom";


class TrackTrip extends Component {

    constructor(props) {
        super(props)
        this.state = {
            jwt: getJwt(),
            travel: this.props.location.state.travel,
            driver: this.props.location.state.driver,
            isFetching: true,
            travelPoints:{},
            tripFile: "",
            currentTravelPoints:{}
        }
        this.componentCleanup = this.componentCleanup.bind(this);
        this.tick = this.tick.bind(this)
        this.handleOnClick = this.handleOnClick.bind(this)
    }

    componentCleanup(){
        clearInterval(this.interval)
    }

    componentDidMount(){
        var taxiTrip = []
        var clientTrip = []

        window.addEventListener('beforeunload', this.componentCleanup);

        Axios({
            method: 'get',
            url: 'https://router.hereapi.com/v8/routes?transportMode=car&origin=' + this.state.travel.driverInitialLatitude +  ',' + this.state.travel.driverInitialLongitude + '&destination=' + this.state.travel.sourceLatitude + ',' + this.state.travel.sourceLongitude + '&apikey=PKjmwpad10e91Bh2JUD7GcjLdM-j9B4PhW3eWUnr8sA&return=polyline&spans=names'
        }).then((response) => {
            for(let i = 0; i < response.data.routes[0].sections[0].spans.length; i++){
                if(response.data.routes[0].sections[0].spans[i].names !== undefined){
                    taxiTrip.push(response.data.routes[0].sections[0].spans[i].names[0].value)
                }
            }

            Axios({
                method: 'get',
                url: 'https://router.hereapi.com/v8/routes?transportMode=car&origin=' + this.state.travel.sourceLatitude +  ',' + this.state.travel.sourceLongitude + '&destination=' + this.state.travel.destinationLatitude + ',' + this.state.travel.destinationLongitude + '&apikey=PKjmwpad10e91Bh2JUD7GcjLdM-j9B4PhW3eWUnr8sA&return=polyline&spans=names'
            }).then((response) => {               
                for(let i = 0; i < response.data.routes[0].sections[0].spans.length; i++){
                    if(response.data.routes[0].sections[0].spans[i].names !== undefined){
                        clientTrip.push(response.data.routes[0].sections[0].spans[i].names[0].value)
                    }
                }

                let auxTravelPoints = {
                    taxiTripPoints: taxiTrip,
                    clientTripPoints: clientTrip,
                    checkedTaxiTripPoints: [],
                    checkedClientTripPoints: []
                }

                this.setState({travelPoints: auxTravelPoints})
                
                 Axios({
                    method: 'POST',
                    url: 'https://cgytidzzce.execute-api.us-east-1.amazonaws.com/taxiApp/starttrip',
                    headers: { 
                        'Authorization': this.state.jwt
                    },
                    data: this.state.travelPoints 
                }).then((response) => {
                    this.setState({tripFile: response.data.tripInfoFile})
                    Axios({
                        method: 'get',
                        url: 'https://cgytidzzce.execute-api.us-east-1.amazonaws.com/taxiApp/tripdetails',
                        params: {
                            'fileName': this.state.tripFile
                        },
                        headers: {
                            Authorization: this.state.jwt
                        }
                    }).then( response => {
                        this.setState({currentTravelPoints: response.data})
                        this.setState({isFetching: false})
                        this.interval = setInterval(() => this.tick(), 1500);
                    }).catch( error => {
                        let httpResponseStatusCode = error.response.status;
                        if (httpResponseStatusCode === 403) {
                            alert("[ERRO] Token de Sessão é inválido ou expirou. Redirecionando para a página de Login")
                            this.props.history.push('/')
                        }
                        else if(httpResponseStatusCode === 400) {
                            alert("[ERRO] Ficheiro com a rota não existe. Tente novamente")
                            this.props.history.push('/home')
                        }
                        else if(httpResponseStatusCode === 404) {
                            alert("[ERRO] Ficheiro com a rota não existe. Tente novamente")
                            this.props.history.push('/home')
                        }
                    })
                })
                    
            })
        })
    }

    componentWillUnmount() {
        this.componentCleanup();
        window.removeEventListener('beforeunload', this.componentCleanup);
    } 
    
    tick() {
        Axios({
            method: 'get',
            url: 'https://cgytidzzce.execute-api.us-east-1.amazonaws.com/taxiApp/tripdetails',
            params: {
                'fileName': this.state.tripFile
            },
            headers: {
                Authorization: this.state.jwt
            }
        }).then( response => {
            this.setState({currentTravelPoints: response.data})
            if(this.state.currentTravelPoints.taxiTripPoints.length ===0 && this.state.currentTravelPoints.clientTripPoints.length ===0) {
                this.componentCleanup();
            }
        }).catch( error => {
            this.componentCleanup();
            let httpResponseStatusCode = error.response.status;
            if (httpResponseStatusCode === 403) {
                alert("[ERRO] Token de Sessão é inválido ou expirou. Redirecionando para a página de Login")
                this.props.history.push('/')
            }
            else if(httpResponseStatusCode === 404) {
                alert("[ERRO] Ficheiro com a rota não existe. Tente novamente")
                this.props.history.push('/home')
            }
        })
    }

    handleOnClick() {
        console.log(this.state.driver.name)
        this.props.history.push({
            pathname: "/evaluation",
            state: {destination: this.state.travel.destinationAddress, driver: this.state.driver.name}
        })
    }

    render() {
        return (
            <div className="travel-container">
                {!this.state.isFetching ?
                <>
                    <div className="Trip-Detais-Container">
                        {(this.state.currentTravelPoints.taxiTripPoints.length !==0 || this.state.currentTravelPoints.clientTripPoints.length !==0)?
                        <>
                            {this.state.currentTravelPoints.taxiTripPoints.length !== 0 ? <>
                                <h1>Taxi a caminho</h1>
                            </>
                            :
                            <>
                                <h1>Em viagem até ao seu destino</h1>
                            </>}                          
                            <div className="Trip-Points-Container">
                                {this.state.currentTravelPoints.taxiTripPoints.length !== 0 ? <>
                                    <div className="Taxi-Trip-Points-Container">
                                        <ul className="Taxi-Trip-Points-List">
                                            {this.state.currentTravelPoints.taxiTripPoints.map((taxiPoint, index) => {
                                                return [
                                                    <div key={index} className="Trip-Point-Container">
                                                        <p>{taxiPoint}</p>
                                                    </div>
                                                ]
                                            })}
                                        </ul>
                                    </div>
                                </> 
                                : 
                                <>
                                    <div className="Client-Trip-Points-Container">
                                        <ul className="Client-Trip-Points-List">
                                            {this.state.currentTravelPoints.clientTripPoints.map((clientPoint, index) => {
                                                return [
                                                    <div key={index} className="Trip-Point-Container">
                                                        <p>{clientPoint}</p>
                                                    </div>
                                                ]
                                            })}
                                        </ul>
                                    </div>
                                </>}
                                <div className="Direction-Points-Container">
                                    <img className="mb-4" alt="directionArrow" src={require('../images/directionArrow.png')}/>
                                </div>
                                <div className="Checked-Points-Container">
                                    <ul className="Checked-Trip-Points-List">
                                        {this.state.currentTravelPoints.taxiTripPoints.length !== 0 ? <>
                                            {this.state.currentTravelPoints.checkedTaxiTripPoints.map((taxiCheckedPoint, index) => {
                                                return [
                                                    <div key={index} className="Trip-Point-Container">
                                                        <p>{taxiCheckedPoint}</p>
                                                    </div>
                                                ]
                                            })}
                                        </>
                                        :
                                        <>
                                            {this.state.currentTravelPoints.checkedClientTripPoints.map((clientCheckedPoint, index) => {
                                                return [
                                                    <div key={index} className="Trip-Point-Container">
                                                        <p>{clientCheckedPoint}</p>
                                                    </div>
                                                ]
                                            })}
                                        </>}
                                    </ul>
                                </div>
                            </div>
                        </>
                        :
                        <>
                            <h1>Chegou ao seu destino</h1>
                            <div className="Destiny-Trip-Container">
                                <img className="mb-4" alt="reached" src={require('../images/reached.png')}/>
                            </div>
                            <div className="button-Evaluation" onClick={this.handleOnClick}>Avaliar Viagem</div>
                        </> 
                        }                    
                        
                    </div>
                </>
                :                
                    <div className="loading-spin-container">
                        <i className="fa fa-circle-o-notch fa-spin"></i>
                        <p>Chamando o seu taxista...</p>
                    </div>
                }
            </div>
        )
    }
}

export default withRouter(TrackTrip);