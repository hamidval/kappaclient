import { render } from '@testing-library/react';
import react from 'react'
import BaseComponent from '../BaseComponent';
import qs from 'qs'
import axios from 'axios'
import DatePicker from "react-datepicker";
class PreviewSingleInvoiceData extends BaseComponent
{

    constructor(props)
    {
        super(props);
        this.state = 
        {
            fromDate:null,
            toDate:null,
            data:null,
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }
    }

    componentDidMount = async () => 
    {
        var queryString = qs.parse(window.location.search, { ignoreQueryPrefix: true })
        var id = queryString.id? queryString.id : null
        var fromYear = queryString.fromYear? queryString.fromYear : null
        var fromMonth = queryString.fromMonth? queryString.fromMonth : null
        var fromDay = queryString.fromDay? queryString.fromDay : null

        var toYear = queryString.toYear? queryString.toYear : null
        var toMonth = queryString.toMonth? queryString.toMonth : null
        var toDay = queryString.toDay? queryString.toDay : null


        var url = `/api/preinvoicesstripe/preview-single-invoice/${id}/${fromDay}/${fromMonth}/${fromYear}/${toDay}/${toMonth}/${toYear}`
        await  axios.get(url,
        {headers:this.state.options, data: null})
        .then(async (response) =>{
            
        this.setState({data:response.data})
    
            })        

    }


    render(){
        return(
        <div>

            <h1>Single Invoice Details</h1>

            <div className='container light-container'>

                {this.state.data != null?
                    <div>
                        <div>Email: {this.state.data.parentEmail}</div>

                        {this.state.data.studentsLessons?.map((studentGroup, index)=>
                        (
                            <div>
                                <div>{studentGroup.student}</div>
                                {
                                    studentGroup.lessons.map((lesson, index)=>
                                    (
                                        <div>{lesson.subject + " | " + lesson.rate + " | " + lesson.feePerLesson + " | " + lesson.date + " | " +  (lesson.stripeInvoiceId? "invoiced" : "not invoiced") }</div>
                                    ))
                                }
                                
                            </div>
                        ))}

                        
                    </div>
                :null}

                

            </div>

        </div>)
    }

}



export default  PreviewSingleInvoiceData


