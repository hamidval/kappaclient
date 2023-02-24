import axios from 'axios'
import {react, Component} from 'react'



class InvoiceReport extends Component 
{
    constructor(props)
    {
        super(props)
        this.state = {
            parents: [],
            parentsCopy: [],
            parent: null,
            month: 0,
            year: 0
        }        
    }

    componentDidMount = () =>
    {
        axios.get('/api/parent/').then((response)=>
        {
            var parents = response.data;
           
            this.setState({parents: parents})
            this.setState({parentsCopy: parents})
        })
    }

    search = (e) =>
    {
        var searchTerm = e.target.value;

        var parents = this.state.parentsCopy.filter((parent) => parent.firstName.includes(searchTerm))

        this.setState({parents: parents})
    }

    searchInvoices = () =>
    {
        console.log(this.state.month)
        var qs = "";
        if(this.state.month != 0)
        {
            qs += "month="+this.state.month.toString()+"&"
        }

        if(this.state.year != 0)
        {
            qs += "year="+this.state.year.toString()
        }

        console.log(qs)
        axios.get('/api/invoice/search?'+qs).then((response)=>
        {
            var invoices = response.data;
           console.log(invoices)
            this.setState({invoices: invoices})
        })


    }

    render()
    {
        return(
            <div className='container'>
                <h1>Invoice Report</h1>

                <div className='row'>
                    <div className='col-8'>
                        {
                            this.state.parent != null?
                                <div className='mb-3'>
                                    {"Selected : "+ this.state.parent?.firstName + " " + this.state.parent?.lastName }
                                </div>
                             :<div className='mb-3'>No parent Selected</div>
                        }

                        <div className='mb-3'>
                            <button
                                onClick={this.searchInvoices}
                                className='btn btn-success'
                            >Search Invoices</button>
                        </div>

                        <div className='mb-3'>
                            <table className='table'>
                                <thead>
                                    <tr>
                                        <td>
                                            Parent
                                        </td>
                                        <td>
                                            Amount
                                        </td>
                                        <td>
                                            Status
                                        </td>
                                        <td>
                                            Link
                                        </td>
                                        <td>
                                            Created On
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.invoices?.map((invoice, index)=>
                                    (
                                        <tr>
                                            <td>{invoice.parentName}</td>
                                            <td>{invoice.invoiceAmount}</td>
                                            <td>{invoice.status}</td>
                                            <td><a href={invoice.stripeInvoiceUrl}><span className=''>icon</span></a></td>
                                            <td>{invoice.createdOn}</td>
                                        </tr>
                                    ))
                                }        
                                </tbody>
                            </table>
                            
                        </div>


                      

                    </div>
                    <div className='col-4'>
                        <div>
                            <label>Month</label>
                            <select 
                                defaultValue={0}
                                onChange={e => this.setState({month: e.target.value})} 
                                className='form-select'>
                                    <option value={0}>None</option>
                                    <option value={1}>Jan</option>
                                    <option value={2}>Feb</option>
                                    <option value={3}>Mar</option>
                                    <option value={4}>April</option>
                                    <option value={5}>May</option>
                                    <option value={6}>June</option>
                                    <option value={7}>July</option>
                                    <option value={8}>Aug</option>
                                    <option value={9}>Sep</option>
                                    <option value={10}>Oct</option>
                                    <option value={11}>Nov</option>
                                    <option value={12}>Dec</option>                                    
                            </select>

                        </div>
                        <div>
                            <label>Year</label>
                            <select 
                                defaultValue={0}
                                onChange={e => this.setState({year: e.target.value})}  
                                className='form-select'>
                                    <option value={0}>None</option>
                                    <option value={2022}>2022</option>
                                    <option value={2023}>2023</option>
                                    <option value={2024}>2024</option>                                   
                            </select>

                        </div>
                        <hr/>
                        <div className='form-group'>
                            <label>Search for parent</label>
                            <input 
                                className='from-group'
                                onChange={e => this.search(e)}
                                /> 
                        </div>
                        <div>
                            {this.state.parents.map((parent, index)=>
                            (
                                <div
                                    onClick={()=>this.setState({parent: parent})} 
                                    class="list-row"
                                    index={index}
                                >{parent.firstName + " " + parent.lastName}</div>
                            ))}
                        </div>
                    </div>
                </div>

               


                


            </div>
        )
    }
}

export default InvoiceReport