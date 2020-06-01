import React, { Component } from "react";
import { getJwt } from "../utils/Jwt";
import { withRouter } from "react-router-dom";

import "../style/Transcription.css";

class Transcription extends Component {

    constructor(props) {
        super(props)
        this.state = {
            location: "",
            JWT: getJwt(),
        }
        this.buttonClickHandler = this.buttonClickHandler.bind(this);
        this.iconClickHandler = this.iconClickHandler.bind(this);
    }

    componentDidMount() {
        try{
            this.setState({location: this.props.location.state.location.replace(".", "")})
        }
        catch(err) {
            console.warn(err)
        }
    }

    buttonClickHandler() {
        this.props.history.push("/home")
    }

    iconClickHandler() {
        this.props.history.push({
            pathname: "/results",
            state: { 'location': document.querySelector("input").value}
        })
    }

    render() {
        return (
            <div className="transcription-container">
                {this.state.location !== "" ?
                <>
                    <h3>Foi isto que pronunciou ?</h3>
                    <p>Caso não, pode editar o texto em baixo ou volte atrás para tentar de novo com o microfone</p>

                </>
                :
                <>
                    <h3>Não foi possível perceber o seu texto de voz!</h3>
                    <p>Pesquise em baixo ou volte atrás para tentar de novo com o microfone</p>
                </>
                }
                <div className="search-container">
                    <input defaultValue={this.state.location}/>
                    <i onClick={this.iconClickHandler} className="fa fa-search"></i>
                </div>
                <div className='button transcription' onClick={this.buttonClickHandler}>Voltar</div>                
            </div>
        )
    }
}

export default withRouter(Transcription);