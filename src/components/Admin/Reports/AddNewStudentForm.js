import {Component} from 'react'
import { Button } from 'reactstrap';
import axios from 'axios'
import YearGroups from '../../Enums/YearGroup';
import PaymentTypes from '../../Enums/PaymentTypes';
class AddNewStudentForm extends Component{

    constructor(props){
        super(props)

        this.state = {
            firstName:null,
            lastName:null,
            discount:null,
            yearGroup:null,
            school:null,
            paymentMethod:null,
            ability:"",
            yearGroups:YearGroups,
            paymentTypes:PaymentTypes,
            parent:this.props.parentId,
            options:this.props.options
        }
    }

    setStudentDiscount= (e) =>{

        if(parseFloat(e.target.value) <=100 && parseFloat(e.target.value)>=0){
      
        this.setState({discount:e.target.value})
        }else{
            alert('invalid discount')
        }
    }


    addStudent = async (e)=>{
        console.log(this.state)
        if(this.state.firstName != null && 
            this.state.lastName != null && 
            this.state.discount != null && 
            this.state.yearGroup != null && 
            this.state.school != null && 
            this.state.parent != null &&
            this.state.paymentMethod != null)
            {
                var student = {
                    firstName:this.state.firstName,
                    lastName:this.state.lastName, 
                    discount:this.state.discount, 
                    yearGroup:this.state.yearGroup, 
                    school:this.state.school, 
                    ability:this.state.ability,
                    paymentMethod:this.state.paymentMethod,
                    parent:this.state.parent,
                    hasLeft:false

                }


                var studentApiStr = "/api/students"
                
                await axios.post(studentApiStr,{headers:this.state.options,student:student})
                .then(async response => {
                       
                        console.log(response.data._id)
                    
                });

                    this.props.toggle()
            }else{
                alert('missing data')
            }
    }


    render(){
        return(
            <div>
                <div class="form-group">
                    <label for="exampleInputPassword1">First Name</label>
                    <input type="text" maxLength="10" class="form-control" id="exampleInputPassword1" placeholder="first name"onChange={e=>this.setState({firstName:e.target.value})}/>
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">Last Name</label>
                    <input type="text" maxLength="10" class="form-control" id="exampleInputPassword1" placeholder="last name"onChange={e=>this.setState({lastName:e.target.value})}/>
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">Discount</label>
                    <input type="number" min="0" max="100" step="1" class="form-control" id="exampleInputPassword1" placeholder="discount"onChange={this.setStudentDiscount}/>
                </div>
                <div className="form-group">
                            <label >Year Group</label>
                            
                            <select class="form-control" id="exampleFormControlSelect1" onChange={e=>this.setState({yearGroup:e.target.value})} >
                                                      <option></option>
                                            {this.state.yearGroups?
                                             
                                             
                                                this.state.yearGroups.map((item,index)=>(
                                                    <option>{item}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                            </select>
                        </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">School</label>
                    <input type="text" class="form-control" id="exampleInputPassword1" placeholder="school" onChange={e=>this.setState({school:e.target.value})}/>
                </div>
                <div className="form-group">
                            <label >Ability</label>
                            <input  class="form-control"  placeholder="ability.." onChange={e=>this.setState({ability:e.target.value})}   />
                </div>
                <div className="form-group">
                            <label >Payment Type</label>
                            <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>{this.setState({paymentMethod:e.target.value})}}>
                                                <option></option>
                                                    {this.state.paymentTypes?
                                                        this.state.paymentTypes.map((item,index)=>(
                                                            <option value={index}>{item}</option>
                                                        ))
                                                    :
                                                    <option>error</option>
                                                    }
                            </select>
                </div>
                <Button color="primary" onClick={this.addStudent}>Add</Button>
            </div>
        )
    }
}

export default AddNewStudentForm