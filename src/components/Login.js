import React, { Component } from 'react';
import '../style/Login.css';
import { withRouter } from 'react-router-dom';
import Axios from 'axios';
import { API_PATH } from '../utils/ApiUtils';


class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
          username: '',
          password: '',
          error: false,
          logginIn: false
        };

        this.changeLoginData = this.changeLoginData.bind(this);
        this.submitLoginForm = this.submitLoginForm.bind(this);
      }

      componentDidMount() {
        localStorage.removeItem('jwt-token')
      }      
      
      changeLoginData(event) {
          this.setState({ [event.target.name]: event.target.value })
      }

      submitLoginForm(e) {
        e.preventDefault();
        this.setState({ logginIn: true})

        const loginData = {
            username: this.state.username,
            password: this.state.password
        }

        const apiLoginUrl =  API_PATH + '/login';
        let options = { method: 'POST', data: loginData }

        Axios(apiLoginUrl, options)
        .then(response => {
            let reponseData = response.data;
            localStorage.setItem('jwt-token', reponseData.token)
            this.props.history.push('/home')
        })
        .catch(error => {
            const httpResponseStatusCode = error.response.status;
            if(httpResponseStatusCode === 401) {
                this.setState({error: true, logginIn: false})
            }
            else {
                alert('[ERRO] Algo de errado não está certo')
            }
        })
      }

    render() {
        return (                            
            <div className="login-container">
                {this.state.logginIn ?
                <div className="loading-spin-container">
                    <i className="fa fa-circle-o-notch fa-spin"></i>
                    <p>Loggin in...</p>
                </div>
                :
                <>
                    <div className="logo-container">
                        <img className="mb-4" alt="logo" src={require('../images/logo.png')}/>
                    </div>
                    <div className="login-form-container">
                        <div className="login-text-container">
                            <h1 align="center">Login</h1>
                        </div>
                        <form className="form-signin" onSubmit={this.submitLoginForm}>
                            <div className="login-form-fields-container">
                                <div className="login-fields-container">
                                    <input type="text" id="username" name="username" placeholder="Username" maxLength="150" required autoFocus onChange={this.changeLoginData} />
                                </div>
                                <div className="login-fields-container">
                                    <input type="password" id="password" name="password" placeholder="Password" maxLength="15" onChange={this.changeLoginData} required  />
                                </div>
                                <div className="invalid-login-message" style={{display: this.state.error ? 'block' : 'none' }}>
                                    <h4 align="center">Invalid Credentials</h4>
                                </div>                            
                                <div className="login-button-container">
                                    <input type="submit" className="login-button" value="Login" />
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            }
            </div>
        )
    }
}

export default withRouter(Login);

// ReactDOM.render(<Login/>, loginForm);