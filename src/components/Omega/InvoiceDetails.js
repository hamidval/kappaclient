import { render } from '@testing-library/react';
import react from 'react'
import BaseComponent from '../BaseComponent';
import qs from 'qs'
import axios from 'axios'
class InvoiceDetails extends BaseComponent
{

    constructor(props)
    {
        super(props);
        this.state = 
        {
            invoice: null,
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }
    }

    componentDidMount = () => 
    {
        var queryString = qs.parse(window.location.search, { ignoreQueryPrefix: true })
        var invoiceId = queryString.id? queryString.id : null
        console.log(invoiceId)

        if(invoiceId != null)
        {
            this.getInvoiceDetails(invoiceId)
        }


    }


    getInvoiceDetails = async (invoiceId) => 
    {
        var url = `/api/preinvoicesstripe/details/${invoiceId}`
        await  axios.get(url,
        {headers:this.state.options, data: null})
        .then(async (response) =>{      
            console.log(response.data) 
           this.setState({invoice: response.data})    
        })    
    }


    render(){
        return(
        <div>

            <h1>Invoice Details</h1>

           

            <div className='container light-container p-3 m-5'>

                {
                    this.state.invoice != null?
                    <div>
                    <div className='row mb-3'>

                        <div className='col ml-5'>
                            Total invoice amount
                        </div>
                        <div className='col mr-5'>
                        {"£ "+this.state.invoice.invoiceAmount/100}
                        </div>            
                        
                    </div>
                    <div className='row mb-3'>
                    <div className='col ml-5'>
                            Status
                        </div>
                        <div className='col mr-5'>
                        {this.state.invoice.status}
                        </div>
                    </div>
                    <table className='table'>    
                            <thead>
                                <tr>
                                    <th>name</th>
                                    <th>date</th>
                                    <th>subject</th>
                                    <th>hours</th>
                                    <th>ppl</th>
                                    <th>fpl</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                                {this.state.invoice.takenLessons.map((lesson, index)=>
                                (
                                    <tr>
                                        <td>{lesson.student.firstName}</td>
                                        <td>{lesson.invoiceDate}</td>
                                        <td>{lesson.subject}</td>
                                        <td>{lesson.hours}</td>
                                        <td>{lesson.payPerLesson}</td>
                                        <td>{lesson.feePerLesson}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    :null
                }

            </div>

        </div>)
    }

}



export default  InvoiceDetails


