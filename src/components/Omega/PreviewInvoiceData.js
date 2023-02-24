import { render } from '@testing-library/react';
import react from 'react'
import BaseComponent from '../BaseComponent';
import qs from 'qs'
import axios from 'axios'
import DatePicker from "react-datepicker";
import dayjs from 'dayjs';
class PreviewInvoiceData extends BaseComponent
{

    constructor(props)
    {
        super(props);
        this.state = 
        {
            fromDate:null,
            toDate:null,

            fromDay:null,
            fromMonth:null,
            fromYear:null,

            toDay:null,
            toMonth:null,
            toYear:null,

            parents:null,
            urlHelper:null,
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }
    }

    componentDidMount = () => 
    {
     

    }


    previewInvoiceData = async () =>
    {
        if(this.state.fromDate != null && this.state.toDate != null){
                
            await  axios.get('/api/preinvoicesstripe/preview-get-lessons-by-parent?fromDate='+this.state.fromDate
            +'&toDate='+this.state.toDate
            +'&invoiceType='+this.state.invoiceType,
                {headers:this.state.options})
            .then(async (response) =>{            
                console.log(response.data)
                    this.setState({parents:response.data})

            })

        }else{
            alert('null Dates')
        }
        
    }

    previewInvoiceDataForParent = async (parentId) =>
    {
        var fromDate = await dayjs(this.state.fromDate)
        var toDate = await dayjs(this.state.toDate)

        var fromDay = await fromDate.get('date')
        var fromMonth = await parseInt(fromDate.get('month'))+1
        var fromYear = await fromDate.get('year')

        var toDay = await toDate.get('date')
        var toMonth = await parseInt(toDate.get('month'))
        var toYear = await toDate.get('year')


        console.log(toMonth)

        var url = await  "/omega/preview-single-invoice?" 
        + "&id=" + parentId
        + "&fromYear=" + fromYear
        + "&fromMonth=" + fromMonth
        + "&fromDay=" + fromDay
        + "&toYear=" + toYear
        + "&toMonth=" + toMonth
        + "&toDay=" + toDay        

        return await url

    }

    updateDate = async (date, isFromDate = false) =>
    {
        var dt = date
        date = dayjs(date)
        if(isFromDate)
        {
            this.setState({fromDay: date.get('date')})
            this.setState({fromMonth: parseInt(date.get('month')+1)})
            this.setState({fromYear: date.get('year')})
            this.setState({fromDate: dt})
        
        }
        else
        {
            this.setState({toDay: date.get('date')})
            this.setState({toMonth: parseInt(date.get('month')+1)})
            this.setState({toYear: date.get('year')})
            this.setState({toDate: dt})
        }
        var url =  "&fromYear=" + this.state.fromYear
        + "&fromMonth=" + this.state.fromMonth
        + "&fromDay=" + this.state.fromDay
        + "&toYear=" + this.state.toYear
        + "&toMonth=" + this.state.toMonth
        + "&toDay=" + this.state.toDay


        await this.setState({urlHelper:url})
        
    }


    render(){
        return(
        <div>

            <h1>All Invoice Details</h1>

            <div className='container'>

            <div className="row">
                <div className="col" >
                    <label class="m-1">From Date</label>
                    <DatePicker className="form-control"
                        selected={this.state.fromDate}
                        onChange={date => this.updateDate(date, true)}
                        />  
                </div>
                <div className="col " >
                    <label class="m-1">To Date</label>
                    <DatePicker className="form-control"
                        selected={this.state.toDate}
                        onChange={date => this.updateDate(date)}
                        />  
                </div>
            </div>


            <div>
                <button className='btn btn-primary' onClick={this.previewInvoiceData}>Get Invoice Data</button>
            </div>

            <table className='table table-reponsive preview-table'>
                <thead>
                    <tr>
                        <th>
                            parent
                        </th>
                        <th>
                            -
                        </th>
                    </tr>
                </thead>
                <tbody>
                {
                    this.state.parents != null?
                        this.state.parents.map((parent, index)=>
                        (
                            <tr>
                                <td>
                                    {parent.parentEmail}
                                </td>
                                <td>
                                    <button className='btn btn-success' onClick={e => this.previewInvoiceDataForParent(parent.parentId)}>Check Invoice</button>
                                    <a className='btn btn-primary' href={"/omega/preview-single-invoice?id="+parent.parentId + this.state.urlHelper}>Check Invoice</a>
                                </td>
                            </tr>
                        ))
                    :null
                }
                </tbody>
            </table>

                

            </div>

        </div>)
    }

}



export default  PreviewInvoiceData


