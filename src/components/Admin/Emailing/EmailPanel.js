import react,{Component} from 'react'
import axios from 'axios'

class EmailPanel extends Component {

    constructor(props){
        super(props)

        this.state = {
            month:null,
            year:null,
            parents:null,
            students:null,
            listToShow:null,
            filterBy:null,
            chosenParents:[],
            chosenStudents:[],
            isSearchChanged:false,
            inlcudeStudentsParents:false,
            includeMonth:false,
            includeYear:false,
            invoices:[],
            options :{ authorization: this.props.token,userid:this.props.userId } 

        }
    }

    componentDidMount = async () =>{
        var parents = await this.getParents()
        this.setState({parents:parents})
        var students = await this.getStudents()
        this.setState({students:students})
    }

    getParents = async () =>{
        var parents = [];

        await  axios.get('/api/parents/all',
                {headers:this.state.options})
            .then(async (response) =>{
                parents = await response.data
            
            })

        return parents
    }

    getStudents = async () =>{
        var students = [];

        await  axios.get('/api/students/all',
                {headers:this.state.options})
            .then(async (response) =>{
                students = await response.data
            
            })

        return students
    }

    setSearchBy = async (e) =>{
        this.setState({filterBy:e.target.value})
        if(this.state.isSearchChanged){
            window.location.reload();
        }
        this.setState({isSearchChanged:true})

      
      
    }

    setStudentCheckbox = async (e,item) =>{
        var isChecked = await e.target.checked
        if(isChecked){
            this.setState({chosenStudents:[...this.state.chosenStudents, item]})
        }else{
            const index = await this.state.chosenStudents.indexOf(item);
            console.log(index)
                if (index > -1) {
                    var list = await this.state.chosenStudents.filter(a=>a!=item);
                    this.setState({chosenStudents:list});
                }

        }
        console.log(this.state.chosenStudents,this.state.chosenParents)
       
    }
    setParentCheckbox = async (e,item) =>{
        var isChecked = await e.target.checked
        if(isChecked){
            this.setState({chosenParents:[...this.state.chosenParents, item]})
        }else{
            const index = await this.state.chosenParents.indexOf(item);
          
                if (index > -1) {
                    var list = await this.state.chosenParents.filter(a=>a!=item);
                    this.setState({chosenParents:list});
                }

        }

       
    }


    search =async  ()=>{
        var month = this.state.includeMonth? ("&month="+this.state.month+"") : null;
        var year = this.state.includeYear? ("&year="+this.state.year+"")  : null;
        var list = []
        var listString = "";

       if(this.state.inlcudeStudentsParents){
            if(this.state.filterBy == 0){ //students
                this.state.chosenStudents.map((student,index)=>{
                    list = [...list,student.parent._id]
                })
            }else{

                this.state.chosenParents.map((parent,index)=>{
                    list = [...list,parent._id]
                })

            }
        }

        list.map((pid,index)=>{
            listString = listString +"&list="+ pid.toString()
        })

        



        await  axios.get('/api/invoices/query?'+month+year+listString,
                {headers:this.state.options})
            .then(async (response) =>{
               var invoices = await response.data
               console.log(invoices)
               this.setState({invoices:invoices})
            
            })





       
    }


    sendInvoices = async  ()  =>{
        if(this.state.invoices.length > 0){
            var ids = this.state.invoices.map(a=> a._id)

            console.log(ids)

            var idsString = "";

            ids.map((id,index)=>{
                idsString = idsString + '&ids='+ id.toString()
            })


            await  axios.get('/api/invoices/send?'+idsString,
                    {headers:this.state.options})
                .then(async (response) =>{
                    var res = await response.data
                    console.log(res)
                
                })
        }



    }






    render(){
        return(
            <div>
                <h1>Email Panel</h1>
                
                <p>
                    Note: most recently made invoices will be retrieved,
                    Only Invoices with a total greater than 0 will be retrrieved and sent
                </p>

                <div className="col" style={{background:'grey'}}>
                    <div className="row mb-2">
                    <label  class="sr-only">Month</label>    
                    <select class="form-control" onChange={e => this.setState({month:e.target.value})}>
                        <option>Month</option>
                        <option value="1" >January</option>
                        <option value="2" >Febuary</option>
                        <option value="3" >March</option>
                        <option value="4" >April</option>
                        <option value="5" >May</option>
                    </select>
                    </div>
                    <div className="row mb-2">
                        <label  class="sr-only">Year</label>
                        <select class="form-control"  onChange={e => this.setState({year:e.target.value})}>
                            <option></option>
                            <option value="2021" >2021</option>
                            <option value="2022" >2022</option>
                            <option value="2023" >2023</option>
                            <option value="2024" >2024</option>
                        </select>
                    </div>
                   
                    <div className="row mb-2">
                        <label  class="sr-only">Search By</label>
                        <select class="form-control" onChange={this.setSearchBy}>
                            <option></option>
                            <option value="0" >Students</option>
                            <option value="1" >Parents</option>
                            
                        
                        </select>
                    </div>

                {
                    this.state.filterBy != null?
                        this.state.filterBy == 0?
                        <div className="row mb-2">
                            <label  class="sr-only">Students</label>
                            <input class="form-control" placeholder="enter students name...." />                    
                    
                        </div>
                        :

                        <div className="row mb-2">
                            <label  class="sr-only">Parent</label>
                            <input class="form-control" placeholder="enter parent name...." />                    
                    
                        </div>


                    
                    :null
                }

                {
                    
                    this.state.filterBy != null?
                        this.state.filterBy == 0?
                        <div className="mb-2">

                                {this.state.students.map((item,index)=>(
                                
                                <div class="form-check">
                                <input class="form-check-input" type="checkbox" value={item} id={item._id} onChange={e=>this.setStudentCheckbox(e,item)} />
                                <label class="form-check-label" >
                                    {item.firstName + ' ' + item.lastName}
                                </label>
                                </div> 
                            ))}                     
                    
                        </div>
                        :

                        <div className=" mb-2">
                            {this.state.parents.map((item,index)=>(
                               
                                <div class="form-check">
                                <input class="form-check-input" type="checkbox" value={item} id={item._id} onChange={e=>this.setParentCheckbox(e,item)} />
                                <label class="form-check-label" >
                                    {item.firstName + ' ' + item.lastName}
                                </label>
                                </div> 
                            ))}                 
                    
                        </div>


                    
                    :null
                }

                {
                    <div className="row mb-2">
                        <div class=" col-2 form-check">
                            <input class="form-check-input" type="checkbox" value="" onChange={e=>this.setState({includeMonth:!this.state.includeMonth})}  />
                            <label class="form-check-label">
                                Month
                            </label>
                        </div>
                        <div class=" col-2 form-check">
                            <input class="form-check-input" type="checkbox" value="" onChange={e=>this.setState({includeYear:!this.state.includeYear})} />
                            <label class="form-check-label" >
                                Year
                            </label>
                        </div>
                        <div class=" col-2 form-check">
                            <input class="form-check-input" type="checkbox" value="" onChange={e=>this.setState({inlcudeStudentsParents:!this.state.inlcudeStudentsParents})} />
                            <label class="form-check-label" >
                                Students/Parents
                            </label>
                        </div>
                    </div>    
                }

                {
                    <button className="btn btn-primary" onClick={this.search}>Search</button>
                }





                {this.state.invoices.length > 0?

                <div>
                    <div>
                        <button className="btn btn-warning" onClick={this.sendInvoices}> Send Invoices </button>
                    </div>    
                
                    {this.state.invoices.map((invoice,index)=>(
                        <div class="row">
                            <div class="col">
                                {invoice.issueDate}
                            </div>
                            <div class="col">
                                {invoice.month}
                            </div> 
                            <div class="col">
                                {invoice.year}
                            </div>
                            <div class="col">
                                {invoice.parent.firstName}
                            </div>       

                        </div>    
                    ))}
                </div>
                :null}






             

                
                    

                 


                </div>
            </div>
        )
    }




}

export default EmailPanel