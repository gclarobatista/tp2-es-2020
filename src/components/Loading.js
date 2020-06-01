import React, { Component } from "react";
import ReactLoading from "react-loading";
import Axios from "axios";
import { getJwt } from "../utils/Jwt";
import { API_PATH } from "../utils/ApiUtils";
import { withRouter } from "react-router-dom";

import "../style/Loading.css"

class Loading extends Component {

    constructor(props) {
        super(props)
        this.state = {
            fileName: this.props.location.state.fileName,
            JWT: getJwt()
        }
        this.componentCleanup = this.componentCleanup.bind(this);
        this.tick = this.tick.bind(this)
    }

    componentCleanup(){
        clearInterval(this.interval)
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.componentCleanup);
        this.interval = setInterval(() => this.tick(), 5000);        
    }

    componentWillUnmount() {
        this.componentCleanup();
        window.removeEventListener('beforeunload', this.componentCleanup);
    }  

    tick() {
        const apiTranscriptionUrl = API_PATH + '/transcription';
        let options = {
            method: 'GET',
            params: { 'fileName': this.state.fileName },
            headers: { Authorization: this.state.JWT }
        }

        Axios(apiTranscriptionUrl, options)
        .then((response) => {
            // this.componentCleanup();
            let responseData = response.data;
            let transcriptedLocation = responseData.transcription;

            this.props.history.push({
                pathname: "/transcription",
                state: { 'location': transcriptedLocation }
            })
        })
        .catch((error) => {
            let httpResponseStatusCode = error.response.status;
            if (httpResponseStatusCode === 403) {
                alert("[ERRO] Token de Sessão é inválido ou expirou. Redirecionando para a página de Login")
                this.props.history.push('/')
            }
            else if(httpResponseStatusCode === 410) {
                alert("[ERRO] Audio submetido não pôde ser transcrito. Tente novamente")
                this.props.history.push('/home')
            }
        })
    }

    render() {
        return (
            <div className="loading-container">
                <h1 style={{color: "#2c2d2d"}}>A processar o seu pedido</h1>
                <ReactLoading type={"bubbles"} color={"#2c2d2d"} id="waitingDots"/>
            </div>
        )
    }
}

export default withRouter(Loading);