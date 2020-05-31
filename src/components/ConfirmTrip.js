import React, { Component } from "react";
import { getJwt } from "../utils/Jwt";
import Axios from "axios";
import { withRouter } from "react-router-dom";

import "../style/ConfirmTrip.css";


class ConfirmTrip extends Component {

    constructor(props) {
        super(props)
        this.state = {
            jwt: getJwt(),
            travel: this.props.location.state.travel,
            driver: {},
            isFetching: true
        }

        this.confirmHandleOnClick = this.confirmHandleOnClick.bind(this)
        this.declineHandleOnClick = this.declineHandleOnClick.bind(this)
    }

    componentDidMount(){
        Axios({
            method: 'get',
            url: '/taxidriver',
            headers: { 
                'Authorization': this.state.jwt
            }   
        }).then((response) => {
            this.setState({driver: response.data})
            this.setState({isFetching: false})
        }).catch((error) => {
            let httpResponseStatusCode = error.response.status; 
            if(httpResponseStatusCode === 403) {
                alert("Token de Sessão é inválido ou expirou. Redirecionando para a página de Login")
                this.props.history.push('/')
            }
            else {
                window.location.reload(false)
                alert("[ERRO] Algo de errado não está certo!")
            }
        })
    }

    confirmHandleOnClick() {
        this.props.history.push({
            pathname: "/trackTrip",
            state: { 'travel': this.state.travel, driver: this.state.driver}
        })
    }

    declineHandleOnClick() {
        this.props.history.push({
            pathname: "/home",
        })
    }

    render() {
        return (
            <div className="travel-container">
                {!this.state.isFetching ?
                <>
                    <h1>Confirmar viagem ?</h1>
                    <div className="tripInfo-container">
                        <p><b>{'Origem: ' }</b> {this.state.travel.sourceAddress}</p>
                        <p><b>{'Destino: ' }</b> {this.state.travel.destinationAddress}</p>
                        <p><b>{'Condutor: ' }</b> {this.state.driver.name}</p>
                        <p><b>{'Veículo: ' }</b> {this.state.driver.car}</p>
                        <p><b>{'Matricula: ' }</b> {this.state.driver.plate}</p>
                        <p><b>{'Classificação Condutor: ' }</b> {this.state.driver.evaluation + '/5'}</p>
                        <p><b>{'Preço: ' }</b> {this.state.travel.price + '€'}</p>
                        <p><b>{'Tempo Estimado de Viagem: ' }</b> {new Date(this.state.travel.estimatedTravelTime * 1000).toISOString().substr(11, 8)}</p>
                        <p><b>{'Distancia: ' }</b> {Math.round((this.state.travel.travelDistance / 1000) * 10) / 10 + ' km'}</p>
                    </div>                    
                    <div className="buttons-container">
                        <div className='button confirm' onClick={this.confirmHandleOnClick} style={{marginRight: '10px'}}>Confirmar</div>
                        <div className='button decline' onClick={this.declineHandleOnClick}>Cancelar</div>
                    </div>
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

export default withRouter(ConfirmTrip);