
import React, {Component} from 'react'
import { Button, ModalBody, ModalFooter } from 'reactstrap';
import Prices from '../Enums/Prices'
import Subjects from '../Enums/Subjects'
import LessonTypes from '../Enums/LessonType'
import Days from '../Enums/Days'
import DatePicker from "react-datepicker";
import axios from 'axios'
import Constants from '../../Constants';
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
class AddLessonForm extends Component {

    constructor(props){
        super(props)
        this.state ={


            newLesson: this.props.copyLesson,
            chosenSubject:null,
            chosenLessonType:null,
            chosenSinglePay:null,
            chosenSingleFee:null,
            chosenGroupPay:null,
            chosenGroupFee:null,
            chosenDayOfWeek:null,
            chosenStartDate:null,
            chosenEndDate:null,
            chosenTeacher:null,
            

            student:this.props.student,
            subjects:Subjects,
            lessonTypes:LessonTypes,
            prices:Prices,
            days:Days,
            teachers:null,
            chosenFeeAdj:0,
            chosenPayAdj:0,
            yearGroup:this.props.student.yearGroup?.toString(),
            price:null,
            
            isCoverLesson:false,
            startDate:null,
            lessonsToAdd:[],
            code:null,
            rate:null,
            
            options :this.props.options,
            previousTeacher:null,
            copyLesson: this.props.copyLesson,

            groupRateKey: null,
            singleRateKey: null,
            groupPrice:null,
            singlePrice:null,
            groupRate:null,
            singleRate:null,
            lessonType:null,
            subject: null



        }
    }
    componentDidMount  = async ()=>{
        await this.getAllTeachers();
        var copyLesson =this.props.copyLesson;  
        console.log(copyLesson)
        if(copyLesson != null)
        {
            this.setState({chosenSubject: copyLesson.subject})
            this.setState({chosenLessonType:copyLesson.lessonType})

            this.setState({chosenSinglePay:copyLesson.singlePay})
            this.setState({chosenSingleFee:copyLesson.singleFee})
            this.setState({chosenGroupPay:copyLesson.groupPay})
            this.setState({chosenGroupFee:copyLesson.groupFee})

            this.setState({chosenDayOfWeek:copyLesson.day})
            this.setState({startDate:copyLesson.startDate})
            this.setState({endDate:copyLesson.endDate})
            this.setState({chosenTeacher:copyLesson.teacherId})
        }
    
    }


    calculateRate = async () =>{

    }

    getAllTeachers = async  () => {
                 
        await axios.get('/api/teacher',{headers:this.state.options})
        .then(async response => {
             var teachers = await response.data;
        
             this.setState({teachers:teachers})
           
         
        });
    }

    addLesson = async (e)=>{

        var newLesson = {
            teacherId:parseInt(this.state.chosenTeacher),
            subject:parseInt(this.state.chosenSubject),         
            studentId:parseInt(this.props.student._id),            
            day:parseInt(this.state.chosenDayOfWeek),
            startDate:formatDate(this.state.chosenStartDate),
            endDate:formatDate(this.state.chosenEndDate),
            groupFee:parseFloat(this.state.chosenGroupFee),
            groupPay:parseFloat(this.state.chosenGroupPay),
            singleFee:parseInt(this.state.chosenSingleFee),
            singlePay:parseInt(this.state.chosenSinglePay),
            lessonType:0      
        }  
        
        console.log(newLesson)

         await axios.post('/api/lesson/add',newLesson)
        .then(async response => {
             console.log(response)
         
        });
       

        
    }

    cancel = (e)=>{
        this.props.resetCopyLesson()
        this.props.toggleAddLessonModal()
    }





    render(){
        return(
            <div>
                <ModalBody>
                <form> 
                <div><strong>Note:</strong> pay and fee adjustments are reset to 0 when copying a lesson</div>
                
                <div className="form-group">
                    <label>Subject - {Subjects[this.props.copyLesson?.subject]}</label>                   
                    <select 
                        class="form-control" 
                        id="exampleFormControlSelect1" 
                        onChange={(e)=> this.setState({chosenSubject: e.target.value}) }
                        defaultValue={this.props.copyLesson?.subject}                        >
                                        <option></option>
                                            {this.state.subjects?
                                                this.state.subjects.map((item,index)=>(
                                                    <option value={index} >{item}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                    </select>
                </div>
                <div className="form-group">
                    <label>Lesson Type</label>
                    
                    <select 
                        class="form-control" 
                        id="exampleFormControlSelect1" 
                        onChange={e=>this.setState({chosenLessonType: e.target.value})}
                        defaultValue={this.props.copyLesson? this.props.copyLesson.lessonType == 0? "Group": "One-To-One": null}
                        >
                                        <option></option>
                                            {this.state.lessonTypes?
                                                this.state.lessonTypes.map((item,index)=>(
                                                    <option value={index}>{item}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                    </select>
                </div>
                <div className="form-group">
                    <label>Single Pay {this.state.copyLesson?.payAdjustment}</label>
                    <input value={this.state.chosenSinglePay} onChange={(e)=>this.setState({chosenSinglePay:e.target.value})} className="form-control" type="number"/>
                </div>
                <div className="form-group">
                    <label>Single Fee {this.state.copyLesson?.feeAdjustment}</label>
                    <input value={this.state.chosenSingleFee} onChange={(e)=>this.setState({chosenSingleFee:e.target.value})} className="form-control" type="number"/>
                </div>
                <div className="form-group">
                    <label>Group Pay {this.state.copyLesson?.payAdjustment}</label>
                    <input value={this.state.chosenGroupPay} onChange={(e)=>this.setState({chosenGroupPay:e.target.value})} className="form-control" type="number"/>
                </div>
                <div className="form-group">
                    <label>Group Fee {this.state.copyLesson?.feeAdjustment}</label>
                    <input value={this.state.chosenGroupFee} onChange={(e)=>this.setState({chosenGroupFee:e.target.value})} className="form-control" type="number"/>
                </div>
                <div className="form-group">
                    <label>Teacher {this.state.copyLesson?.teacher}</label>
                    <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setState({chosenTeacher:e.target.value})}>
                                        <option></option>
                                            {this.state.teachers?
                                                this.state.teachers.map((item,index)=>(
                                                    <option value={item._id}>{item.firstName}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                    </select>
                </div>
                <div className="form-group">
                    <label>Day of the week</label>{this.state.copyLesson? "("+Days[this.state.copyLesson.day] +")": null}
                    <div >
                    <select value={this.state.chosenDayOfWeek}
                     defaultValue={this.state.copyLesson?.day} class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setState({chosenDayOfWeek:e.target.value})}>
                                        <option></option>
                                            {this.state.days?
                                              Object.keys(this.state.days).map(key => 
                                                <option selected={this.state.copyLesson?.day == key} value={key}>{this.state.days[key]}</option>
                                            )
                                            :
                                            <option>error</option>
                                            }
                                        </select>                   

                    </div>
                   
                </div>
                <div className="form-group">
                    <label for="exampleInputEmail1">Start Date</label>{this.state.copyLesson? "("+this.state.copyLesson.startDate.slice(0,10) +")": null}
                    <div className="col">
                        <DatePicker className="form-control"
                        selected={this.state.chosenStartDate}
                        onChange={date => this.setState({chosenStartDate:date})}
                        dateFormat="dd/MM/yyyy"
                         />  

                    </div>
                </div>
                <div className="form-group">
                    <label for="exampleInputEmail1">End Date</label>{this.state.copyLesson? "("+this.state.copyLesson.endDate.slice(0,10) +")": null}
                    <div className="col">
                        <DatePicker className="form-control"
                        selected={this.state.chosenEndDate}
                        onChange={date => this.setState({chosenEndDate:date})}
                        dateFormat="dd/MM/yyyy"
                         />  

                    </div>
                </div>
                <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault"onChange={e=>this.setState({isCoverLesson:!this.state.isCoverLesson})}/>
                <label class="form-check-label" for="flexCheckDefault">
                    Cover Lesson
                </label>
                </div>
                </form>

                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.addLesson}>Add Extra Lesson</Button>{' '}
                    <Button color="secondary" onClick={this.cancel}>Cancel</Button>
                </ModalFooter>
            </div>
        )
    }
}

export default AddLessonForm