import React, { Component } from 'react';
import '../style/Login.css';
import { withRouter } from 'react-router-dom';
import Axios from 'axios';


class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
          username: '',
          password: '',
          error: false,
          logginIn: false
        };

        this.change = this.change.bind(this);
        this.submit = this.submit.bind(this);
      }

      componentDidMount() {
        localStorage.removeItem('jwt-token')
      }      
      
      change(e) {
          this.setState({
              [e.target.name]: e.target.value
          })
      }

      submit(e) {
        e.preventDefault();
        let loginData = JSON.stringify({
            username: this.state.username,
            password: this.state.password
        })
        
        this.setState({ logginIn: true})
        Axios({
            method: 'post',
            url: 'https://cgytidzzce.execute-api.us-east-1.amazonaws.com/taxiApp/login',
            data: loginData
        }).then(res => {
            let tokenObj = JSON.stringify(res.data);
            localStorage.setItem('jwt-token', JSON.parse(tokenObj).token)
            this.props.history.push('/home')
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
                            <form className="form-signin" onSubmit={this.submit}>
                                <div className="login-form-fields-container">
                                    <div className="login-fields-container">
                                        <input type="text" id="username" name="username" placeholder="Username" maxLength="150" required autoFocus onChange={this.change} />
                                    </div>
                                    <div className="login-fields-container">
                                        <input type="password" id="password" name="password" placeholder="Password" maxLength="15" onChange={this.change} required  />
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