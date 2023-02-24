import {Component} from 'react'
import axios from 'axios'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
class AllTeachers extends Component{

    constructor(props){
        super(props)
        this.state = {
            teachers:null,
            showEditTeacherModal:false,
            showAddTeacherModal:false,
            chosenTeacher:null,
            newTeacher:{},
            options :{ authorization: this.props.token,userid:this.props.userId }
        }
    }   

    componentDidMount = async () =>{
        this.getTeachers()
    }

    getTeachers = async () =>{
        await axios.get('/api/teachers/all',
        {headers:this.state.options})
        .then(async response => {
             var data = await response.data;
             console.log(data)
             this.setState({teachers:data})
           
         
        });
    }

    toggleAddTeacherModal = async (e)=>{
        
        this.setState({showAddTeacherModal:!this.state.showAddTeacherModal})
    }

    toggleEditTeacherModal = async (e)=>{
    
        this.setState({showEditTeacherModal:!this.state.showEditTeacherModal})
    }

    setChosenTeacher = async (index) =>{
        var teacher = await this.state.teachers[index];
        teacher.update = {_id:teacher._id}
        
        console.log(teacher)
        await this.setState({chosenTeacher:teacher})
        await this.toggleEditTeacherModal()
    }


    updateFullName = (e) =>{
        if(e.target.value.length >0){

            var teacher = this.state.chosenTeacher
            teacher.update.fullName = e.target.value

        } 

    }


    updateBonus = (e) =>{
        if(e.target.value.length >0){

            var teacher = this.state.chosenTeacher
            teacher.update.bonus = e.target.value

        } 

    }
    updateEmail = (e) =>{
        if(e.target.value.length >0){

            var teacher = this.state.chosenTeacher
            teacher.update.email = e.target.value

        } 

    }

    updateRole = (e) =>{
        if(e.target.value.length >0){

            var teacher = this.state.chosenTeacher
            teacher.update.role = e.target.value

        } 

    }

    updateTeacher = async (e) =>{
        const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var correctFormat = true
        if(this.state.chosenTeacher.update.email != null){
             correctFormat = await  regexp.test(this.state.chosenTeacher.update.email);
        }
        if(correctFormat){

            var update = this.state.chosenTeacher.update
            await axios.post('/api/teachers/update-teacher',
            {headers:this.state.options,teacher:update})
            
    
            
            this.toggleEditTeacherModal()
            this.getTeachers()
            this.setState({chosenTeacher:null})

        }else{
            alert('incorrect email format')
        }
       

    }

    deleteTeacher = async (e) =>{

        console.log('yo')
        await axios.delete('/api/teachers/delete?id='+this.state.chosenTeacher._id.toString(),
        {headers:this.state.options})

        this.toggleEditTeacherModal(e)
    }

    updateNewFullName = (e) =>{
        if(e.target.value.length >0){

            var teacher = this.state.newTeacher
            teacher.fullName = e.target.value

        } 

    }

    updateNewEmail = (e) =>{
        if(e.target.value.length >0){

            var teacher = this.state.newTeacher
            teacher.email = e.target.value

        }

    }


    updateNewBonus = (e) =>{
        if(e.target.value.length >0){

            var teacher = this.state.newTeacher
            teacher.bonus = e.target.value

        } 

    }
    updateNewRole = (e) =>{
        if(e.target.value.length >0){

            var teacher = this.state.newTeacher
            teacher.role = e.target.value

        } 

    }

    addTeacher = async (e) =>{
        const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var correctFormat = await  regexp.test(this.state.newTeacher.email);

        if(correctFormat){

            var teacher = this.state.newTeacher
        await axios.post('/api/teachers',
        {headers:this.state.options,teacher:teacher})
        

        this.setState({newTeacher:{}})
        this.toggleAddTeacherModal()
        this.getTeachers()

        }else{
            alert('incorrect email format')
        }
        

    }

    render(){
        return(
            <div>
                <div className="container">
                    <h1>All Teachers</h1>
                    <div>Teachers must be added/removed from Auth0 aswell</div>

                    <div>
                        <button className="btn btn-primary" onClick={this.toggleAddTeacherModal} >Add Teacher</button>
                    </div>

                    

                    <table className="table table-responsive table-light">
                        <thead>
                        <th>
                                <tr>ID</tr>
                            </th>
                            <th>
                                <tr>Full Name</tr>
                            </th>
                            <th>
                                <tr>Email</tr>
                            </th>
                      
                            <th>
                                <tr>Bonus</tr>
                            </th>
                            <th>
                                <tr>Role</tr>
                            </th>
                            <th>
                                <tr>Edit</tr>
                            </th>

                        </thead>
                        <tbody>
                        {
                            this.state.teachers?.length>0?
                                this.state.teachers.map((item,index)=>(
                                    <tr>
                                        <td>{item._id}</td>
                                        <td>{item.fullName}</td>
                                        <td>{item.email}</td>
                                        <td>{item.bonus}</td>
                                        <td>{item.role}</td>
                                        <td><button className="btn btn-danger" onClick={e=>this.setChosenTeacher(index)}>edit</button></td>
                                    </tr>

                                ))
                            :null
                        }
                        </tbody>
                    </table>
                    

                </div>


                <Modal isOpen={this.state.showEditTeacherModal} toggle={this.toggleEditTeacherModal} >
                        <ModalHeader >Edit Teachers</ModalHeader>
                        <ModalBody>
                           {
                               this.state.chosenTeacher?

                               <div className="container">
                               <div className=" form-group">
                                   <label>Full Name</label>
                                   <input className="form-control" onChange={this.updateFullName}></input>
                               </div>

                               <div className=" form-group">
                                   <label>Email</label>
                                   <input className="form-control" onChange={this.updateEmail}></input>
                               </div>
                      
                               <div className="form-group">
                                   <label>Bonus</label>
                                   <input className="form-control"  onChange={this.updateBonus}></input>
                               </div>
                               <div className="form-group">
                                   <label>Role</label>
                                   <input className="form-control"  onChange={this.updateRole}></input>
                               </div>
                               
                               

                           </div>
                               
                               :<div>no teacher chosen</div>
                           }
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" onClick={this.updateTeacher} >Save Changes</Button>{' '}
                            <Button color="danger" onClick={this.deleteTeacher} >Delete</Button>{' '}
                            <Button color="secondary" onClick={this.toggleEditTeacherModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>



                    <Modal isOpen={this.state.showAddTeacherModal} toggle={this.toggleAddTeacherModal} >
                        <ModalHeader >Add Teacher</ModalHeader>
                        <ModalBody>
                           {
                              

                               <div className="container">
                               <div className=" form-group">
                                   <label>Full Name</label>
                                   <input className="form-control" onChange={this.updateNewFullName}></input>
                               </div>

                               <div className=" form-group">
                                   <label>Email</label>
                                   <input className="form-control" onChange={this.updateNewEmail}></input>
                               </div>
                          
                               <div className="form-group">
                                   <label>Bonus</label>
                                   <input className="form-control"  onChange={this.updateNewBonus}></input>
                               </div>
                               <div className="form-group">
                                   <label>Role</label>
                                   <input className="form-control"  onChange={this.updateNewRole}></input>
                               </div>
                               
                               

                           </div>
                               
                            
                           }
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" onClick={this.addTeacher} >Save Changes</Button>{' '}
                            
                            <Button color="secondary" onClick={this.toggleAddTeacherModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

            </div>
                
                           
           
        )
    }
}

export default AllTeachers