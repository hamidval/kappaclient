import {Component} from 'react'
import DatePicker from "react-datepicker";
import axios from 'axios'
import jsPDF from 'jspdf'
class MonthlyReport extends Component{

    constructor(props){
        super(props)
        this.state = {
            fromDate:new Date("2021-12-25"),
            toDate:new Date("2022-01-25"),
            data:null,
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }
    }

    getData = async (e) =>{

        if(this.state.fromDate != null && this.state.toDate != null){

            if(this.state.fromDate < this.state.toDate){
                    await  axios.get('/api/taken-lessons/query-monthly-report?fromDate='+this.state.fromDate.toString()+'&toDate='+this.state.toDate.toString()        ,
                    {headers:this.state.options})
                .then(async (response) =>{
                    console.log(response.data)
                    await this.setState({data:response.data})
                
                })
            }else{
                alert('date error')
            }
        }else{
            alert('missing dates')
        }
    }

    download = async () =>{
        var doc = new jsPDF('p', 'pt', 'a2');     
        doc.setFontSize(10);   
       
        var source = await window.document.getElementById("MonthlyReport")
        await doc.html(
            source
            );


           await doc.output("dataurlnewwindow");

    }

    render(){
        return(
            <div id="MonthlyReport" className="container">
                <h1>Monthly Report</h1>
                <div className="row">
                    <div className="col">
                    <label>From Date</label>
                            <DatePicker className="form-control"
                                selected={this.state.fromDate}
                                onChange={date => this.setState({fromDate:date})}
                                />  
                    </div>
                    <div className="col">
                    <label>To Date</label>
                            <DatePicker className="form-control"
                                selected={this.state.toDate}
                                onChange={date => this.setState({toDate:date})}
                                />  
                    </div>

                </div>
                <div className="row">
                    <div className="col">
                        <button className="btn btn-warning" onClick={this.getData}>Get Report</button>
                    </div>                  
                </div>
                <div className="m-2">
                        <button className="btn btn-success" onClick={this.download}>
                            Download
                        </button>
                    
                </div>    
                {
                    this.state.data?
                        
                        <div className="col">
                            <div className="row">
                            <div class="card text-white bg-danger mt-3 mb-3 w-100 " >
                            <div class="card-header">Revenue</div> 
                            <div class="card-body">
                                <h5 class="card-title">{this.state.data.revenue[0]?.revenue}</h5>
                                
                            </div>
                            </div>
                            </div>
                            <div className="row">
                            <div class="card text-white bg-primary mb-3 w-100 " >
                            <div class="card-header">Teacher Salaries</div> 
                            <div class="card-body">
                                {this.state.data.teacherPay.map((teacherPay,index)=>(
                                    <h5 class="card-title">{teacherPay?.teacher +'   Pay : '+teacherPay.totalPay + " Actual Rate : " + this.state.data.actualRates.find((rate)=> rate.teacher[0].fullName == teacherPay.teacher)?.rate} </h5>
                                ))}
                                
                                
                            </div>
                            </div>
                            </div>
                            <div className="row">
                            <div class="card text-white bg-warning mb-3 w-100 " >
                            <div class="card-header">Cash Revenue</div> 
                            <div class="card-body">  {this.state.data.revenueFromCash[0]?.amount}                               
                                
                            </div>
                            </div>
                            </div>

                            <div className="row">
                                <div class="card text-white bg-info mb-3 w-100 " >
                                    <div class="card-header">Number of Taken Lessons</div> 
                                    <div class="card-body">  {this.state.data.numberOfTakenLessons}                               
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div class="card text-white bg-info mb-3 w-100 " >
                                    <div class="card-header">Number of Lessons Added</div> 
                                    <div class="card-body">  {this.state.data.numberOfLessonsCreated}                               
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div class="card text-white bg-info mb-3 w-100 " >
                                    <div class="card-header">Number of Students Added</div> 
                                    <div class="card-body">  {this.state.data.numberOfStudentsCreated}                               
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div class="card text-white bg-info mb-3 w-100 " >
                                    <div class="card-header">Number of Parents Added</div> 
                                    <div class="card-body">  {this.state.data.numberOfParentsCreated}                               
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div class="card text-white bg-success mb-3 w-100 " >
                                    <div class="card-header">Number of Invoices Created</div> 
                                    <div class="card-body">  {this.state.data.numberOfInvoicesCreated}                               
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div class="card text-white bg-success mb-3 w-100 " >
                                    <div class="card-header">Cost</div> 
                                    <div class="card-body"> £ {this.state.data.cost}                               
                                        
                                    </div>
                                </div>
                            </div>

                        </div>
                :null} 
            </div>
        )
    }

}


export default MonthlyReport