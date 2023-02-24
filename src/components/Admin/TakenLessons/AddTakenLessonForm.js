import React, {Component} from 'react'
import { Button, ModalBody, ModalFooter } from 'reactstrap';
import Subjects from '../../Enums/Subjects'
import Corrections from '../../Enums/Corrections'
import Days from '../../Enums/Days'
import DatePicker from "react-datepicker";
import axios from 'axios'

class AddTakenLessonForm extends Component {

    constructor(props){
        super(props)
        this.state ={
            chosenDate:"",
            chosenCorrection:0,
            chosenSubject:null,
            chosenTeacher:null,
            chosenStudent:null,
            chosenPrice:null,
            chosenRate:null,
            chosenHours:null,
            chosenDay:null,
            chosenDiscount:null,
            isExtra:false
   

        }
    }

    componentDidMount=()=>{
        console.log(this.props.userId)
        this.setState({chosenStudent:this.props.chosenStudent})
    }

    setChangedDate = (date)=>{
        this.setState({chosenDate:date})
    }
    
    addTakenLesson = (e)=>{
        if(this.state.chosenDate != null  &&
          
            this.state.chosenSubject != null  &&
            this.state.chosenTeacher != null  &&
            this.state.chosenStudent != null  &&
            this.state.chosenPrice != null  &&
            this.state.chosenHours != null  &&
            this.state.chosenDay != null  &&
            this.state.chosenRate != null  &&
            this.state.chosenDiscount != null 
            ){
               
                this.createTakenLesson()


            }else{
                alert('missing data');
            }



    




    }

    createTakenLesson = async ()=>{     
    
        var options =  { authorization: this.props.token,
            userid:this.props.userId }
            
        var teacherId = this.state.chosenTeacher;
        var subject = this.state.chosenSubject;
        var correction = this.state.chosenCorrection
        var studentId = this.state.chosenStudent._id;
        var rateKey = "";
        var price  = this.state.chosenPrice;
        var rate = this.state.chosenRate;
        var hours = this.state.chosenHours;
        var date = this.state.chosenDate;
        var discount = this.state.chosenDiscount;
        var day = this.state.chosenDay                
        
        console.log(this.props.userId)
            var url = await '/api/taken-lessons?tid='+teacherId+
            '&s='+subject+
            '&rkey='+rateKey+
            '&rate='+rate+
            '&day='+day+
            '&sid='+studentId+
            '&p='+price+
            '&c='+correction+
            '&h='+hours+
            '&da='+date+
            '&di='+discount+
            '&ie='+this.state.isExtra;
        await axios.post(url,{ headers:options })
         .then(response =>{
             console.log(response.data)
             this.props.toggleAddModal()
        })

  
}

checkDiscount = async (e)=>{

    var discount = e.target.value
    if(discount <= 100 && discount >=0){
        this.setState({chosenDiscount:parseFloat(e.target.value)})
    }else{
        this.setState({chosenDiscount:0})
        alert('incorrect discount')
    }
    
    

}


    render(){
        return(
            <div>
                <ModalBody>
                <div className="col">
                <div className="row">
                        <div className="col-4">Is Extra</div>                      
                        <div className="col-3">
                        <div class="form-check">
                            <input onClick={(e)=>this.setState({isExtra:!this.state.isExtra})} class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked={this.state.isExtra}/>
                        </div>
                        </div>
                        <div className="col-3" >
                            {this.state.chosenDate
                            ?"done":"not done"}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Date</div>                      
                        <div className="col-3">
                            <DatePicker className="form-control"
                            selected={this.state.chosenDate}
                            onChange={date=>this.setChangedDate(date)}
                            
                            /> 
                        </div>
                        <div className="col-4" >
                            {this.state.chosenDate
                            ?"done":"not done"}
                        </div>
                    </div>
                  
                    <div className="row">
                        <div className="col-4">Correction</div>
                       
                        <div className="col">
                            <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setState({chosenCorrection:e.target.value})}>
                                 
                                            {Corrections?
                                              Corrections.map((item,index) => 
                                                <option value={index}>{item}</option>
                                            )
                                            :
                                            <option>error</option>
                                            }
                            </select>  
                        </div>
                        <div className="col">
                            {
                                
                                "optional"
                                
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Subject</div>
                        
                        <div className="col">
                            <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setState({chosenSubject:e.target.value})}>
                                            <option></option>
                                            {Subjects?
                                              Subjects.map((item,index) => 
                                                <option value={item}>{item}</option>
                                            )
                                            :
                                            <option>error</option>
                                            }
                            </select>  
                        </div>
                        <div className="col">
                            {   this.state.chosenSubject?
                               "done":"not done"
                                
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Teacher</div>
                        
                        <div className="col">
                            <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setState({chosenTeacher:e.target.value})}>
                                        <option></option>
                                            {this.props.teachers?
                                              this.props.teachers.map((item,index) => 
                                                <option value={item._id}>{item.fullName}</option>
                                            )
                                            :
                                            <option>error</option>
                                            }
                            </select>  
                        </div>
                        <div className="col">
                            {
                                this.state.chosenTeacher?
                                "done":"not done"
                                
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Student</div>
                        
                        <div className="col">
                           <div>{this.state.chosenStudent?.firstName}</div>
                        </div>
                        <div className="col">
                            {
                                this.state.chosenStudent?
                                 "done":"not done"
                                
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Day</div>
                        
                        <div className="col">
                        <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setState({chosenDay:e.target.value})}>
                                        <option></option>
                                            {Days?
                                              Object.keys(Days).map(key => 
                                                <option value={key}>{Days[key]}</option>
                                            )
                                            :
                                            <option>error</option>
                                            }
                                        </select>    
                        </div>
                        <div className="col">
                            {
                                this.state.chosenDay?
                                 "done":"not done"
                                
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Discount</div>
                        
                        <div className="col">
                            <input type="number" min="0" max="100" step="1" class="form-control" onChange={this.checkDiscount}>
                                     
                            </input>  
                        </div>
                        <div className="col">
                            {
                                this.state.chosenDiscount?
                                 "done":"not done"
                                
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Price (per hour)</div>
               
                        <div className="col-3">
                            <input className="form-control" type="number"  onChange={(e)=>this.setState({chosenPrice:e.target.value})}></input> 
                        </div>
                        <div className="col">
                            {
                                this.state.chosenPrice?
                                "done":"not done"                                
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Rate (per hour)</div>                   
                        <div className="col-3">
                            <input className="form-control" onChange={(e)=>this.setState({chosenRate:e.target.value})}></input> 
                        </div>
                        <div className="col-3">
                            {   
                                this.state.chosenRate?
                               "done":"not done"
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Hours</div>
                        
                        <div className="col-3">
                        <input className="form-control" type="number"  onChange={e=>this.setState({chosenHours:e.target.value})}></input>  
                        </div>
                        <div className="col-3">
                            {   
                                this.state.chosenHours?
                               "done":"not done"
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">Total for lesson</div>
                     
                        <div className="col">{
                            this.state.chosenHours*this.state.chosenPrice
                        }</div>
                    </div>

                </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.addTakenLesson}>Add Extra Taken Lesson</Button>{' '}
 
                    <Button color="secondary" onClick={()=>{this.props.toggleAddModal()}}>Cancel</Button>
                </ModalFooter>
            </div>
        )
    }
}

export default AddTakenLessonForm