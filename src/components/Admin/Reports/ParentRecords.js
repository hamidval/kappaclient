import {Component} from 'react'
import axios from 'axios'
import ParentRecordsRow from './ParentRecordsRow'

class ParentRecords extends Component{

    constructor(props){
        super(props)
        this.state = {
            sortBy:null,
            skip:0,
            parents:null,
            filteredParents:null,
            options :{ authorization: this.props.token,userid:this.props.userId } }
    }

    getData = async () =>{
        await axios.get('/api/parents/sort-all?sortBy='+this.state.sortBy,
        {headers:this.state.options})
        .then(async response => {
             var data = await response.data;
             console.log(data)
             this.setState({parents:data})
             this.setState({filteredParents:data})
           
         
        });

    }

    prev = async () =>{
        if(this.state.skip != 0){
            await this.setState({skip:this.state.skip-300})
            await this.getData()

        }

    }

    next = async () =>{

        if(this.state.parents.length > 0){
            await this.setState({skip:this.state.skip+300})
            await this.getData()
        }
    }

    deleteParent = async (parentId,index) =>{
        console.log(index)
        var parents = this.state.filteredParents;

         await axios.delete('/api/parents?id='+parentId,
         {headers:this.state.options})
         .then(async response => {
              var data = await response.data;
              console.log(data)           
         
         });

        parents.splice(index,1)
        this.setState({parents:parents})
       

    }

    filter = (e) =>{
        var filter = e.target.value
        var parents = this.state.parents;
        var filteredParents = parents.filter((a)=>(a.firstName.toLowerCase().includes(filter) || a.lastName.toLowerCase().includes(filter)))
        this.setState({filteredParents:filteredParents})
        
    }
    


    render(){
        return(
            <div className="container">
                <h1>Parent Records</h1>
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
                    this.state.filteredParents?


                    <div className="mt-4 mb-3">
                   <input className="form-control" placeholder="start typing.." onChange={this.filter}/>
                </div>
                    :null

                }
                <div>
                    <button className="btn btn-primary m-3" onClick={e=>this.getData()}>GetData</button>
                </div>
                <table class="table table-dark">
                    <thead>
                        <tr>
                        <th>#</th>
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">email</th>
                        <th scope="col">-</th>
                        <th scope="col">-</th>
                        <th scope="col">-</th>
                        </tr>
                    </thead>
                    <tbody>
                       {this.state.filteredParents?
                        this.state.filteredParents.map((parent,index)=>(

                            parent.firstName != "deleted"?

                            <  ParentRecordsRow 
                             parent={parent}
                             index={index}
                             deleteParent={this.deleteParent}
                             options={this.state.options}
                             />
                            :null
                        
                          
                        ))
                       :null}
                    </tbody>
                    </table>

            
                        {/* <div className="row">
                    <div className="col">
                        <button className="btn btn-primary" disabled={this.state.parents == null || this.state.skip ==0 }  onClick={this.prev}>prev</button>

                    </div>
                    <div className="col">
                         <button className="btn btn-primary" disabled={this.state.parents == null || this.state.parents?.length == 0} onClick={this.next}>next</button>
                    </div>

                </div> */}
                        
             
                
            </div>
        )
    }
}

export default ParentRecords