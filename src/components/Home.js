import React, { Component } from 'react';
import '../style/Home.css';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';
import { getJwt } from '../utils/Jwt';
import { withRouter } from 'react-router-dom';
import ReactLoading from "react-loading";
import Axios from 'axios';
import { API_PATH } from '../utils/ApiUtils';


const Mp3Recorder = new MicRecorder({ bitRate: 128 });

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isRecording: false,
            blobURL: '',
            JWT: getJwt(),
            isBlocked: false,
            isLoading: false
        }
        this.askForMicrophonePermission = this.askForMicrophonePermission.bind(this);
        this.micStartRecording = this.micStartRecording.bind(this);
        this.micStopRecording = this.micStopRecording.bind(this);
        this.microphoneHandler = this.microphoneHandler.bind(this)
        this.blobToBase64 = this.blobToBase64.bind(this);
        this.sendFileToServer = this.sendFileToServer.bind(this);
    }

    askForMicrophonePermission() {
        navigator.getUserMedia({ audio: true },
            () => {
                this.setState({ isBlocked: false });
            },
            () => {
                this.setState({ isBlocked: true })
            },
        );
    }

    micStartRecording() {
        Mp3Recorder
        .start()
        .then(() => {
            this.setState({ isRecording: true });
        }).catch((e) => console.error(e)); 
        document.getElementById("microButton").style.backgroundColor = "green";
    }
    
    micStopRecording(){
        Mp3Recorder
        .stop()
        .getMp3()
        .then(([buffer, blob]) => {
            document.getElementById("microButton").style.backgroundColor = "red";
            const blobURL = URL.createObjectURL(blob)
            this.setState({ blobURL, isRecording: false });
            this.blobToBase64(blob);
        })
        .catch((error) => alert('[ERRO] Erro durante a gravação do áudio. Tente novamente'));
    }
    
    microphoneHandler() {        
        this.askForMicrophonePermission();       

        if (this.state.isBlocked) {
            alert('[ERRO] Não existe permissão para usar o microfone')
        } else {
            if(this.state.isRecording === false) {
                this.micStartRecording();               
            }
            else {
               this.micStopRecording();
            } 
        }
    }

    blobToBase64(blob) {
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            this.sendFileToServer(reader.result);
        }
    }
    
    sendFileToServer(base64data) {
        this.setState({isLoading: true});    
        
        const apiSubmitAudioUrl = API_PATH + '/audiofile';
        let options = {
            method: 'POST',
            headers: { 
                'Authorization': this.state.JWT
            },
            data: base64data
        }
        
        Axios(apiSubmitAudioUrl, options)
        .then((response) => {
            let responseData = response.data;
            let fileName = responseData.transcriptionRequest + ".json";
            this.props.history.push({
                pathname: "/loading",
                state: { 'fileName': fileName }
            })
        })
        .catch((error) => {
            const httpResponseStatusCode = error.response.status; 
            if(httpResponseStatusCode === 403) {
                alert("[ERRO] Token de Sessão é inválido ou expirou. Redirecionando para a página de Login")
                this.props.history.push('/')
            }
            else {
                window.location.reload(false)
                alert("[ERRO] Algo de errado não está certo!")
            }
        });
    }

    render() {
        return (
			<div className="home-container">                
                {this.state.isLoading ?
                    <>
                        <h1 style={{color: "#2c2d2d"}}>A processar o seu pedido</h1>
                        <ReactLoading type={"bubbles"} color={"#2c2d2d"} id="waitingDots"/>
                    </>
                    :
                    <>
                        <p>Use o microfone para indicar o seu destino pretendido</p>
                        <h1>Para onde ?</h1>
                        <div id="microButton" onClick={this.microphoneHandler}>
                            <i className="fa fa-microphone"></i>
                        </div>
                    </>
                }
                {this.state.isRecording ? <ReactLoading type={"bars"} color={"#737070"} /> : null}
	        </div>
        )
    }
}

export default withRouter(Home);