import React,{Component} from 'react'
import "react-datepicker/dist/react-datepicker.css";
class OmegaPanel extends Component{


    constructor(props){
        super(props)
        this.state = {
          
        }

    
    }

   
    
    render(){
        return(
            <div className="container">
                <h1 className="mt-2">Omega Panel</h1>
                <div className="row m-3 mt-5" >
                <div className="col">
                    <div className="row">
                    <div >
                        <a className="btn btn-primary m-2" href={'/admin/add-new-students-2'} >
                            Create New Student
                        </a>
                    </div>

                    </div>
                    <div className="row" >
                    <div>
                    <a className="btn btn-danger m-2" href={'/admin/edit-student-lessons'} >
                        Add or Edit Student Lessons
                    </a>
                    </div>

                    </div>
                    <div className="row" >
                    <div>
                    <a className="btn btn-danger m-2" href={'/admin/modify-taken-lessons'} >
                        Modify Taken Lessons
                    </a>
                    </div>

                    </div>
                    

                </div>
                <div className="col">
                    <div className="row">
                        <a className="btn btn-danger m-2" href={'/omega/hack-register'} >
                            HackRegister
                        </a>
                    </div>
                    <div className="row">
                    <a className="btn btn-danger m-2" href={'/omega/hack-lessons'} >
                        hack lessons
                    </a>
                    </div>

                </div>
                <div className="col">
                    <div className="row" >
                        <a className="btn btn-warning m-2" href={'/admin/invoice-status-table'} >
                            Invoice Table
                        </a>
                    </div>
                    <div className="row" >
                        <a className="btn btn-warning m-2" href={'/admin/email-panel'} >
                            Email Panel
                        </a>
                    </div>
                    <div className="row" >
                        <a className="btn btn-warning m-2" href={'/admin/payment-panel'} >
                            Payment Panel
                        </a>
                    </div>
                    <div className="row" >
                        <a className="btn btn-success m-2" href={'/admin/monthly-report'} >
                            Monthly Report
                        </a>
                    </div>
                    <div className="row" >
                        <a className="btn btn-info m-2" href={'/admin/pre-invoice'} >
                            Stripe Invoices
                        </a>
                    </div>

                </div>
                <div className="col">
                    <div className="row">
                        <a className="btn btn-info m-2" href={'/admin/student-records'} >
                           Student Records
                        </a>
                    </div>
                    <div className="row">
                        <a className="btn btn-info m-2" href={'/admin/parent-records'} >
                           Parent Records
                        </a>
                    </div>

                    
                    <div className="row">
                        <a className="btn btn-info m-2" href={'/admin/all-teachers'} >
                           Teacher Records
                        </a>
                    </div>
                    

                </div>
                
                </div>
                
                
                
                
                
                
                
            </div>
        )
    }



}

export default OmegaPanel;