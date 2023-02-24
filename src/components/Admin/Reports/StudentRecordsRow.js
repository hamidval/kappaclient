import react ,{Component} from 'react'
import axios from 'axios'
import YearGroups from '../../Enums/YearGroup';
import PaymentTypes from '../../Enums/PaymentTypes';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
class StudentRecordsRow extends Component{

    constructor(props){
        super(props)
        this.state = {
            showOtherModal:false, 
            showDeleteModal:false,  
            showEditModal:false,   
            options :{ authorization: this.props.token,userid:this.props.userId } }
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

    deleteStudent = (e) =>{
        this.props.deleteStudent(this.props.student._id,this.props.index)
        this.toggleDeleteModal()
    }


    edit = async(e) => {
      
        await axios.post('/api/students/edit?id='+this.props.student._id,
        {headers:this.props.options,student:this.props.student})
        .then(async response => {
             var data = await response.data;
             console.log(data)    
             this.toggleEditModal()       
         
        });

        

    }

    updateFirstName = (e) =>{
        this.props.student.firstName = e.target.value
        this.props.student.changed = true
    }
    updateLastName = (e) =>{
        this.props.student.lastName = e.target.value
        this.props.student.changed = true
    }
  

    setStudentDiscount= (e) =>{

        if(parseFloat(e.target.value) <=100 && parseFloat(e.target.value)>=0){
            this.props.student.discount = e.target.value
            this.props.student.changed = true
        }else{
            alert('invalid discount')
        }
    }
    updateSchool = (e) =>{
        this.props.student.school = e.target.value
        this.props.student.changed = true
    }
    updateYearGroup = (e) =>{
        this.props.student.yearGroup = e.target.value
        this.props.student.changed = true
    }
    updatePaymentType = (e) =>{
        this.props.student.paymentMethod = e.target.value
        this.props.student.changed = true
    }

    

    


    render(){
        return(
     
                            <tr>
                                <td>{this.props.index+1}</td>
                                <td>{this.props.student._id}</td>
                                <td>{this.props.student.firstName}</td>
                                <td>{this.props.student.lastName}</td>
                                <td>{this.props.student.discount}</td>
                                <td>{this.props.student.paymentMethod?PaymentTypes[parseInt(this.props.student.paymentMethod)]:null}</td>
                                <td><button className="btn btn-danger" onClick={this.toggleDeleteModal}>Delete</button></td>
                                <td><button className="btn btn-danger" onClick={this.toggleEditModal}>Edit</button></td>
                                <td><button className="btn btn-primary" onClick={this.toggleOtherModal}>Other</button></td>

                                <Modal isOpen={this.state.showOtherModal} toggle={this.toggleOtherModal} >
                        <ModalHeader >You are about to remove a lesson</ModalHeader>
                        <ModalBody>
                            <div className="mb-3" >
                            <a className="btn btn-success" href={'/admin/edit-student-lessons?id='+this.props.student._id} >View Lessons</a>
                            </div>
                            {/* <div className="mb-3" >
                            <a className="btn btn-success" href={'/admin/modify-taken-lessons?id='+this.props.student._id} >View Taken Lessons</a>
                            </div>  */}
                            <div className="mb-3" >
                            <a className="btn btn-success" href={'/admin/payment-panel?sid='+this.props.student._id} >View Invoice / Payments</a>
                            </div>

                          
                         
                        </ModalBody>
                        <ModalFooter>
                            
                            <Button color="secondary" onClick={this.toggleOtherModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={this.state.showDeleteModal} toggle={this.toggleDeleteModal} >
                        <ModalHeader >You are about to delete a student</ModalHeader>
                        
                        <ModalBody>

                            <div>
                                Warning! <br/>
                                1. this will delete all their lessons <br/>

                                2 . all their taken lessons will be unreferenced <br/>  
                            </div>
                            

                          
                         
                        </ModalBody>
                        <ModalFooter>
                        <Button color="primary" onClick={this.deleteStudent}>Delete</Button>
                            <Button color="secondary" onClick={this.toggleDeleteModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={this.state.showEditModal} toggle={this.toggleEditModal} >
                        <ModalHeader >Edit Student Details</ModalHeader>
                        <ModalBody>
                            <p>Note: 
                                only change if absolutly necessary, if it's easier to delete and create a new student, then please do,

                                any details in taken lessons by this student will not be updated
                            </p>

                            <div className="container">
                                <div className="row form-group">
                                    <label>Frist Name</label>
                                    <input className="form-control" type="text" maxLength="20" onChange={this.updateFirstName}></input>
                                </div>
                                <div className="row form-group">
                                    <label>Last Name</label>
                                    <input className="form-control" type="text" maxLength="20" onChange={this.updateLastName}></input>
                                </div>
                                <div className="row form-group">
                                    <label>Discount</label>                               
                                    <input type="number" min="0" max="100" step="1" class="form-control"  placeholder="0-100"  onChange={e=>this.setStudentDiscount(e)}  />
                                </div>
                                <div className="row form-group">
                                    <label>Year Group</label>
                                    <select  class="form-control" onChange={e=>this.updateYearGroup(e)} >
                                            {YearGroups?                                           
                                             
                                                YearGroups.map((item,index)=>(
                                                    <option  value={item} >{item}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                                    </select>
             
                                </div>

                                <div className="row form-group">
                                    <label>Payment Type</label>
                                    <select  class="form-control" onChange={e=>this.updatePaymentType(e)} >
                                            {PaymentTypes?                                           
                                             
                                                PaymentTypes.map((item,index)=>(
                                                    <option  value={index} >{item}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                                    </select>
             
                                </div>
                                

                            </div>
                            

                          
                         
                        </ModalBody>
                        <ModalFooter>
                        <Button color="primary" onClick={this.edit}>Edit</Button>
                            <Button color="secondary" onClick={this.toggleEditModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                            </tr>
                           
           
        )
    }
}

export default StudentRecordsRow