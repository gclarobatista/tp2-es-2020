import React, { Component } from "react";
import "../style/Evaluation.css";
import { getJwt } from "../utils/Jwt";
import { withRouter } from "react-router-dom";
import Axios from "axios";
import { TouchableHighlightBase } from "react-native";


class Evaluation extends Component {

    constructor(props) {
        super(props)
        this.state = {
            JWT: getJwt(),
            isFetching: false,
            destination: this.props.location.state.destination,
            driver: this.props.location.state.driver,
            rating: 0,
            requestSuccess: false
        }

        this.handleOnClick = this.handleOnClick.bind(this)
    }

    componentDidMount() {
        document.querySelectorAll('.input-star').forEach(item => {
            item.addEventListener('click', onclick => {
                this.setState({rating: item.value})
            })
        })
    }

    handleOnClick() {
        console.log(this.state.destination)
        Axios({
            method: 'POST',
            url: 'https://cgytidzzce.execute-api.us-east-1.amazonaws.com/taxiApp/evaluation',
            headers: {
                Authorization: this.state.JWT
            },
            data: {
                rating: this.state.rating,
                destination: this.state.destination,
                driver: this.state.driver
            }
        }).then( response => {
            this.setState({requestSuccess: true})

        }).catch( error => {
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


    render() {
        return (
            <div className="evaluation-container">
                {this.state.requestSuccess ?
                <>
                    <div className="evaluation-submited-container">
                        <h1>Obrigado !</h1>
                        <p>A sua avaliação foi registada: </p>
                        <p><b>Avaliação: </b>{this.state.rating}/5</p>
                        <p><b>Condutor: </b>{this.state.driver}</p>
                        <p><b>Destino: </b>{this.state.destination}</p>
                    </div>
                    <div className="button-submit" onClick={() => this.props.history.push('/home')}>Página Inicial</div>
                </>
                :
                <>
                <h1>Avalie o serviço</h1>
                <div className="stars-container"> 
                    <fieldset className="rating">
                        <input className="input-star" type="radio" id="star5" name="rating" value="5" /><label className = "full" htmlFor="star5" title="Fantástico - 5 estrelas"></label>
                        <input className="input-star" type="radio" id="star4half" name="rating" value="4.5" /><label className="half" htmlFor="star4half" title="Muito bom - 4.5 estrelas"></label>
                        <input className="input-star" type="radio" id="star4" name="rating" value="4" /><label className = "full" htmlFor="star4" title="Muito bom - 4 estrelas"></label>
                        <input className="input-star" type="radio" id="star3half" name="rating" value="3.5" /><label className="half" htmlFor="star3half" title="Meh - 3.5 estrelas"></label>
                        <input className="input-star" type="radio" id="star3" name="rating" value="3" /><label className = "full" htmlFor="star3" title="Meh - 3 estrelas"></label>
                        <input className="input-star" type="radio" id="star2half" name="rating" value="2.5" /><label className="half" htmlFor="star2half" title="Ligeiramente mau - 2.5 estrelas"></label>
                        <input className="input-star" type="radio" id="star2" name="rating" value="2" /><label className = "full" htmlFor="star2" title="Ligeiramente mau - 2 estrelas"></label>
                        <input className="input-star" type="radio" id="star1half" name="rating" value="1.5" /><label className="half" htmlFor="star1half" title="Mau - 1.5 estrelas"></label>
                        <input className="input-star" type="radio" id="star1" name="rating" value="1" /><label className = "full" htmlFor="star1" title="Terrível - 1 estrelas"></label>
                        <input className="input-star" type="radio" id="starhalf" name="rating" value="0.5" /><label className="half" htmlFor="starhalf" title="Este chefe devia ser preso - 0.5 estrelas"></label>
                    </fieldset>
                </div>
                <div className="button-submit" onClick={this.handleOnClick}>Submeter</div>    
                </>            
                }
            </div>
        )
    }
}

export default withRouter(Evaluation);