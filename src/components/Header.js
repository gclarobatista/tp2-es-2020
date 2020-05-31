import React, { Component } from 'react';
import { withRouter } from "react-router-dom"
class Header extends Component {
    constructor(props){
        super(props);
        this.state = {
            allowed: false
        };
    }

    render() {       
        return (
            <div>
               <h1>Eder</h1>
            </div>
        )
    }
}

export default Header;