import React,{Component} from 'react'
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios'
class AdminPanel extends Component{


    constructor(props){
        super(props)
        this.state = {
          
        }

        

        this.componentDidMount = () => 
        {
            const token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjViYzdiZmYyLTI0MTEtNDE0Yy04MWJkLTMzMDgzYWFiYjhhZiIsInN1YiI6Im5hbWUiLCJlbWFpbCI6Im5hbWUiLCJqdGkiOiI0ZDZjYzU3YS1lM2RiLTQzZTYtYjljOC1iZjk2OGJiODQxMDEiLCJuYmYiOjE2NzYyMTA0ODEsImV4cCI6MTY3NjI0MDQ4MSwiaWF0IjoxNjc2MjEwNDgxLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTcxLyIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjcxNzEifQ.TEzbm6rvfT9uCIq7WyAmS_i1MpOEcLBinBa9hJlIjh79zzSaLYeM8C673iJIqmPz-ERF9LBw0RuMVk2JdqqhCw"
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            axios.get('/api/teacher',config).then(async(response)=>{
                console.log(response.data)
        })
        }

       
    }

   
    
    render(){
        return(
            <div className="container">
                <h1>Admin Panel</h1>
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
                    {/* <div className="row" >
                    <div>
                    <a className="btn btn-danger m-2" href={'/admin/modify-taken-lessons'} >
                        Modify Taken Lessons
                    </a>
                    </div>

                    </div> */}
                    

                </div>
                <div className="col">
                    
                </div>
                <div className="col">
               
               
                    <div className="row" >
                        <a className="btn btn-warning m-2" href={'/admin/payment-panel'} >
                            Payment Panel
                        </a>
                    </div>
                    
                    <div className="row" >
                        <a className="btn btn-warning m-2" href={'/admin/admin-pre-invoice'} >
                           Pre Invoice Payment Panel
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

                    
               
                    

                </div>
                
                </div>
                
                
                
                
                
                
                
            </div>
        )
    }



}

export default AdminPanel;