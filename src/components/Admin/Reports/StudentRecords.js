import react ,{Component} from 'react'
import axios from 'axios'
import StudentRecordsRow from './StudentRecordsRow'
import qs from 'qs'

class StudentRecords extends Component{

    constructor(props){
        super(props)
        this.state = {
            sortBy:null,
            skip:0,
            students:null,
            filteredStudents:null,
            sid:null,
            searchString: "",
            options :{ authorization: this.props.token,userid:this.props.userId } }
    }

    componentDidMount =  async ()=>{
        var queryString = await qs.parse(window.location.search, { ignoreQueryPrefix: true })
        var sid = await queryString.sid? queryString.sid : null
        if(sid != null){
            this.setState({sid:sid})
            await this.getData();
        }
    }

    getData = async () =>{

        if(this.state.sid != null){

            await axios.get('/api/student/'+this.state.sid,
            this.props.data.config)
            .then(async response => {
                 var data = await response.data;
                    console.log(data)
                 this.setState({students:data})
                 this.setState({filteredStudents:data})
               
             
            });  

        }else{

        await axios.get('/api/students/search?searchString='+this.state.searchString,
        {headers:this.state.options})
        .then(async response => {
             var data = await response.data;
             console.log("search")
             this.setState({students:data})
             this.setState({filteredStudents:data})
           
         
        });


        }
        

    }

    deleteStudent = async (studentId,index) =>{
        console.log(index)
        var students = this.state.filteredStudents;

        await axios.delete('/api/students?id='+studentId,
        {headers:this.state.options})
        .then(async response => {
             var data = await response.data;
             console.log(data)           
         
        });

        students.splice(index,1)
        this.setState({students:students})


    }


    filter = async (e) =>{
        var filter = e.target.value
        this.setState({searchString: e.target.value})
        
        await axios.get('/api/students/search?searchString='+this.state.searchString,
        {headers:this.state.options})
        .then(async response => {
             var data = await response.data;
             console.log("search")
             this.setState({students:data})
             this.setState({filteredStudents:data})
           
         
        });
    }

    
    


    render(){
        return(
            <div className="container">
                <h1>Student Records</h1>
                <div>
                    <label>Sort By</label>
                    <select className="form-control form-select" onChange={e=>this.setState({sortBy:e.target.value})}>
                        <option selected>Open this select menu</option>
                        <option value="firstName">first name</option>
                        <option value="lastName">last name</option>
                        <option value="3">school</option>
                    </select>
                </div>
                {
     
                    <div className="mt-4 mb-3">
                   <input className="form-control" placeholder="start typing.." onChange={this.filter}/>
                </div>
                  

                }
                
              
                <table class="table table-dark">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th scope="col">Id</th>
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">discount</th>
                        <th scope="col">Payment type</th>
                        <th scope="col">-</th>
                        <th scope="col">-</th>
                        <th scope="col">-</th>
                        </tr>
                    </thead>
                    <tbody>
                       {this.state.filteredStudents?
                        this.state.filteredStudents.map((student,index)=>(

                            student.firstName != "deleted"?

                            <   StudentRecordsRow 
                                options={this.state.options}
                                student={student}
                                deleteStudent={this.deleteStudent}
                            
                                index={index}
                           />
                            :null
                          
                        ))
                       :null}
                    </tbody>
                    </table>
                    {
                     
                        
                        // <div className="row">
                        //     <div className="col">
                        //         <button disabled={this.state.students == null || this.state.skip ==0 } className="btn btn-primary" onClick={this.prev}>prev</button>
        
                        //     </div>
                        //     <div className="col">
                        //         <button disabled={this.state.students == null || this.state.students?.length == 0} className="btn btn-primary" onClick={this.next}>next</button>
                        //     </div>
    
                        // </div>                     
                        
                        
           
                    
                 }
                
            </div>
        )
    }
}

export default StudentRecords