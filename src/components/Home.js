import React, { Component } from 'react';
import '../style/Home.css';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';
import { getJwt } from '../utils/Jwt';
import { withRouter } from 'react-router-dom';
import ReactLoading from "react-loading";
import Axios from 'axios';


const Mp3Recorder = new MicRecorder({ bitRate: 128 });

class Home extends Component {
    constructor(props) {
        super(props)
        // this.sendFileToServer = this.sendFileToServer.bind(this)
        this.state = {
            isRecording: false,
            blobURL: '',
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

    askForMicrophonePermission(){
        navigator.getUserMedia({ audio: true },
            () => {
                console.log('Permission Granted');
                this.setState({ isBlocked: false });
            },
            () => {
                console.log('Permission Denied');
                this.setState({ isBlocked: true })
            },
        );
    }

    micStartRecording(){
        Mp3Recorder
        .start()
        .then(() => {
            this.setState({ isRecording: true });
        }).catch((e) => console.error(e)); 
        document.querySelector("#microButton").style.backgroundColor = "green";
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
        }).catch((e) => console.log(e));
    }
    
    microphoneHandler() {        
        this.askForMicrophonePermission();       

        if (this.state.isBlocked) {
          console.log('Permission Denied');
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
        let jwt = getJwt();
        this.setState({isLoading: true});    
        
        Axios({
            method: 'post',
            url: 'https://cgytidzzce.execute-api.us-east-1.amazonaws.com/taxiApp/audiofile',
            headers: { 
                'Authorization': jwt
            },
            data: base64data
        }).then((response) => {
            let responseString = JSON.stringify(response.data);
            let fileName = JSON.parse(responseString).transcriptionRequest + ".json";
            this.props.history.push({
                pathname: "/loading",
                state: { 'fileName': fileName }
            })
        }).catch((error) => {
            let httpResponseStatusCode = error.response.status; 
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