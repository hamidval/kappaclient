import {Component} from 'react'
import axios from 'axios'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import AddNewStudentForm from './AddNewStudentForm'
class ParentRecordsRow extends Component{

    constructor(props){
        super(props)
        this.state = {
            showOtherModal:false,
            showDeleteModal:false, 
            showEditModal:false,     
            showAddStudentModal:false,  
            students:[],
            options :this.props.options}
    }


    toggleOtherModal = () =>{
        this.setState({showOtherModal:!this.state.showOtherModal})
    }
    toggleDeleteModal = () =>{
        this.setState({showDeleteModal:!this.state.showDeleteModal})
    }
    toggleEditModal = () =>{
        this.setState({showEditModal:!this.state.showEditModal})
    }
    toggleAddStudentModal = () =>{
        this.setState({showAddStudentModal:!this.state.showAddStudentModal})
    }


    deleteParent = (e) =>{
        this.props.deleteParent(this.props.parent._id,this.props.index)
        this.toggleDeleteModal()
    }
    edit = async(e) => {

        const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var correctFormat = await  regexp.test(this.props.parent.email);
        
        if(correctFormat){

            await axios.post('/api/parents/edit?id='+this.props.parent._id,
         {headers:this.props.options,parent:this.props.parent})
         .then(async response => {
              var data = await response.data;
              console.log(data)    
              this.toggleEditModal()       
         
         });

        }else{
            alert('incorrect email format')
        }
         

        

    }

    updateFirstName = (e) =>{
        this.props.parent.firstName = e.target.value
        this.props.parent.changed = true
    }
    updateLastName = (e) =>{
        this.props.parent.lastName = e.target.value
        this.props.parent.changed = true
    }
    updateEmail = (e) =>{
        this.props.parent.email = e.target.value
        this.props.parent.changed = true
    }
    getStudents = async (e) =>{
        var pid = this.props.parent._id

        await axios.get('/api/students/pid?pid='+pid,
         {headers:this.props.options,parent:this.props.parent})
         .then(async response => {
              var data = await response.data;
                  console.log(data)
              this.setState({students:data})       
         
         });


    }
 

    


    render(){
        return(
     
                            <tr>
                                <td>{this.props.parent._id}</td>
                                <td>{this.props.parent.firstName}</td>
                                <td>{this.props.parent.lastName}</td>
                                <td>{this.props.parent.email}</td>
                                <td><button className="btn btn-danger" onClick={this.toggleDeleteModal} >Delete</button></td>
                                <td><button className="btn btn-danger" onClick={this.toggleEditModal}>Edit</button></td>
                                <td><button className="btn btn-primary" onClick={this.toggleOtherModal}>Other</button></td>

                                <Modal isOpen={this.state.showOtherModal} toggle={this.toggleOtherModal} >
                        <ModalHeader >You are about to remove a lesson</ModalHeader>
                        <ModalBody>
                            <div className="mb-3" >
                            <a className="btn btn-danger" onClick={this.toggleAddStudentModal} >Add Student</a>
                            </div>
                            <div className="col">
                            <a className="btn btn-success" href={'/admin/payment-panel?pid='+this.props.parent._id}>invoice / payment records</a>
                            </div>
                            <div className="mb-3" >
                            <a className="btn btn-primary" onClick={this.getStudents} >Students</a>
                            </div>
                            {
                                this.state.students.length>0?
                                    this.state.students.map((student,index)=>(

                                        <div className="row">
                                            <div className="col">
                                                    {student.firstName + " " + student.lastName}
                                            </div>
                                            <div className="col">
                                                    <a className="btn btn-success" href={'/admin/edit-student-lessons?id='+student._id}>View lessons</a>
                                            </div>
                                             {/* <div className="col">
                                                    <a className="btn btn-success" href={'/admin/modify-taken-lessons?id='+student._id}>View taken lessons</a>
                                            </div> */}
                                            <div className="col">
                                                    <a className="btn btn-success" href={'/admin/student-records?sid='+student._id}>student records</a>
                                            </div>

                           
                                        

                                        </div>

                                    ))
                                :null
                            }
                        

                          
                         
                        </ModalBody>
                        <ModalFooter>
                            
                            <Button color="secondary" onClick={this.toggleOtherModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={this.state.showDeleteModal} toggle={this.toggleDeleteModal} >
                        <ModalHeader >You are about to delete a parent,
                            all students/lessons related to this parent will be deleted
                        </ModalHeader>
                        <ModalBody>
                            

                          
                         
                        </ModalBody>
                        <ModalFooter>
                        <Button color="primary" onClick={this.deleteParent}>Delete</Button>
                            <Button color="secondary" onClick={this.toggleDeleteModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={this.state.showEditModal} toggle={this.toggleEditModal} >
                        <ModalHeader >Edit Parent Details</ModalHeader>
                        <ModalBody>
                            <p>Note: 
                                only change if absolutly necessary, if it's easier to delete and create a new parent, then please do,

                                
                            </p>

                            <div className="container">
                                <div className="row form-group">
                                    <label>Frist Name</label>
                                    <input type="text" maxLength="15" className="form-control" onChange={this.updateFirstName}></input>
                                </div>
                                <div className="row form-group">
                                    <label>Last Name</label>
                                    <input type="text" maxLength="15" className="form-control" onChange={this.updateLastName}></input>
                                </div>
                                <div className="row form-group">
                                    <label>Email</label>
                                    <input type="email" className="form-control" onChange={this.updateEmail}></input>
                                </div>
                                
                                

                            </div>
                            

                          
                         
                        </ModalBody>
                        <ModalFooter>
                        <Button color="primary" onClick={this.edit}>Edit</Button>
                            <Button color="secondary" onClick={this.toggleEditModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={this.state.showAddStudentModal} toggle={this.toggleAddStudentModal} >
                        <ModalHeader >Add Student</ModalHeader>
                        <ModalBody>
                        <AddNewStudentForm parentId={this.props.parent._id}
                         toggle={this.toggleAddStudentModal}
                         options={this.state.options}
                         />

                          
                         
                        </ModalBody>
                        <ModalFooter>
                        
                            <Button color="secondary" onClick={this.toggleAddStudentModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                            </tr>
                           
           
        )
    }
}

export default ParentRecordsRow