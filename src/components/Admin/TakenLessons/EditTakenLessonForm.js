import { extract } from 'query-string'
import React, {Component} from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Prices from '../../Enums/Prices'
import Subjects from '../../Enums/Subjects'
import Corrections from '../../Enums/Corrections'
import Days from '../../Enums/Days'
import DatePicker from "react-datepicker";
import axios from 'axios'
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
class EditTakenLessonForm extends Component {

    constructor(props){
        super(props)
        this.state ={
            lessonId:null,
            changedDate:'',
            chosenCorrection:null,
            chosenSubject:null,
            chosenTeacher:null,
            chosenRate:null,
        
            chosenPrice:null,
            chosenHours:null
   

        }
    }

    componentDidMount = ()=>{
        console.log(this.props.chosenLesson)
    }

    setChangedDate = (date)=>{
        console.log(date,"1")
        this.setState({changedDate:date})
    }
    
    editTakenLesson = async  (e)=>{


        console.log(this.state.changedDate,
            this.state.chosenCorrection,
            this.state.chosenSubject,
            this.state.chosenTeacher,
            this.state.chosenStudent,
            this.state.chosenPrice,
            this.state.chosenHours
            )
            var data = {
                rate: this.props.chosenLesson.rate,
                hours: this.props.chosenLesson.hours,
                price: this.props.chosenLesson.price,
                correction: this.props.chosenLesson.correction
            }

            if(this.state.changedDate != ''){
                data.date = formatDate(this.state.changedDate)
            }

            if(this.state.chosenCorrection != null){
                data.correction = this.state.chosenCorrection
            }

            if(this.state.chosenSubject != null){
                data.subject = this.state.chosenSubject
            }

            if(this.state.chosenTeacher != null){
                data.teacher = this.state.chosenTeacher
            }

            if(this.state.studentId != null){
                data.student = this.state.studentId
            }

            if(this.state.chosenPrice != null){
                data.price = this.state.chosenPrice
            }

            if(this.state.chosenHours != null){
                data.hours = this.state.chosenHours
            }

            if(this.state.chosenRate != null){
                data.rate = this.state.chosenRate
                
            }

            data.payPerLesson = data.rate * data.hours
            data.feePerLesson = data.price * data.hours

            

            var options =  { authorization: this.props.token,
                userid:this.props.userId }
           


                console.log(data,"2")
             await axios.post('/api/taken-lessons/update?id='+this.props.chosenLesson._id,{headers:options,data:data})
             .then(async response =>{
                     var data = response.data;
                     console.log(data)
                     this.cancel()
             })

            alert('lesson updated')
    }

    deleteLesson = async (e) =>{
        var options =  { authorization: this.props.token,
            userid:this.props.userId }
        await axios.delete('/api/taken-lessons/delete?id='+this.props.chosenLesson._id,{headers:options})
            .then(async response =>{
                    var data = response.data;
                    console.log(data)
            })
            this.cancel();
        alert('lesson deleted')

    }

    cancel = (e) =>{
        this.props.toggleModal()
    }


    render(){
        return(
            <div>
                <ModalBody>
                <div className="col">
                    <div className="row">
                        <div className="col-3">Date</div>
                        <div className="col-3">{(this.props.chosenLesson.date.toString().slice(0,10))}</div>
                        <div className="col-3">
                            <DatePicker className="form-control"
                            selected={this.state.changedDate?this.state.changedDate:''}
                            onChange={date=>this.setChangedDate(date)}
                            
                            /> 
                        </div>
                        <div className="col-3" >
                            {(new Date(this.state.changedDate.toString())) == (new Date(this.props.chosenLesson.date.toString())) ||
                                this.state.changedDate == ""
                            ?"not changed":"changed"}
                        </div>
                    </div>
                  
                    <div className="row">
                        <div className="col">Correction</div>
                        <div className="col">{this.props.chosenLesson.correction}</div>
                        <div className="col">
                            <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setState({chosenCorrection:e.target.value})}>
                                        <option></option>
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
                                this.state.chosenCorrection?
                                this.state.chosenCorrection == this.props.chosenLesson.correction?"not changed":"changed"
                                :null
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">Subject</div>
                        <div className="col">{this.props.chosenLesson.subject}</div>
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
                                this.state.chosenSubject == this.props.chosenLesson.subject?"not changed":"changed"
                                :null
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">Teacher</div>
                        <div className="col">{this.props.chosenLesson.teacher.fullName}</div>
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
                                    this.state.chosenTeacher == this.props.chosenLesson.teacher._id?"not changed":"changed"
                                :null
                            }
                        </div>
                    </div>
                   
                    <div className="row">
                        <div className="col">Price (per hour)</div>
                        <div className="col">{this.props.chosenLesson.price}</div>
                        <div className="col-3">
                            <input className="form-control" onChange={(e)=>this.setState({chosenPrice:e.target.value})}></input> 
                        </div>
                        <div className="col">
                            {
                                this.state.chosenPrice?
                                this.state.chosenPrice == this.props.chosenLesson.price?"not changed":"changed"
                                :null
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">Rate (per hour)</div>
                        <div className="col">{this.props.chosenLesson.rate}</div>
                        <div className="col-3">
                            <input className="form-control" onChange={(e)=>this.setState({chosenRate:e.target.value})}></input> 
                        </div>
                        <div className="col">
                            {
                                this.state.chosenRate?
                                this.state.chosenRate == this.props.chosenLesson.rate?"not changed":"changed"
                                :null
                            }
                        </div>
                    </div>
                   

                    <div className="row">
                        <div className="col">Hours</div>
                        <div className="col">{this.props.chosenLesson.hours}</div>
                        <div className="col-3">
                        <input className="form-control" onChange={e=>this.setState({chosenHours:e.target.value})}></input>  
                        </div>
                        <div className="col-3">
                            {   
                                this.state.chosenHours?
                                this.state.chosenHours == this.props.chosenLesson.hours?"not changed":"changed"
                                :null
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">Total for lesson</div>
                        <div className="col">
                        {this.props.chosenLesson.hours*this.props.chosenLesson.price*((100-this.props.chosenLesson.discount)/100)}
                        </div>
                        <div className="col">{
                            this.state.chosenHours*this.state.chosenPrice
                        }</div>
                    </div>

                </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.editTakenLesson}>Edit Extra Taken Lesson</Button>{' '}
                    <Button color="danger" onClick={this.deleteLesson}>Delete</Button>
                    <Button color="secondary" onClick={this.cancel}>Cancel</Button>
                </ModalFooter>
            </div>
        )
    }
}

export default EditTakenLessonForm