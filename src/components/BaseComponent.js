
import { Component } from "react";
import axios from "axios";

export default class BaseComponent extends Component
{
    constructor(props)
    {
        super(props)
        this.state =
        {
            errorTimer: 10000,
            error: null
        }
    }


    async sendApiRequest(url, data)
    {
        
        var response = null;
        var errorMessage = null;
        await axios.post(url, data)
                 .then((response)=>
                 {
                    if(response)
                    {
                        response = response;
                    }
                 })
                 .catch((err) =>
                 {
                    this.props.setErrorMessage(err.response.data.message)                    
                 })

            return await response
    }


    setErrorTimeout = () =>
    {
        setTimeout(()=>this.setState({error: null}), this.state.errorTimer);
    }
    

}