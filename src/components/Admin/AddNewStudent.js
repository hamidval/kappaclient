import React,{Component} from 'react'
import data from '../data.json';
import DatePicker from "react-datepicker";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Prices from '../Enums/Prices'
import Subjects from '../Enums/Subjects'
import LessonTypes from '../Enums/LessonType'
import Days from '../Enums/Days'
import {ProgressBar} from 'react-bootstrap';
import "react-datepicker/dist/react-datepicker.css";
import YearGroups from '../Enums/YearGroup';
import Teachers from '../Enums/Teachers';
import axios from 'axios'
var background =
{
  
    padding:'0',
    margin:'0',

    top:'0',
    left:'0',

    width: '100%',
    height: '100%',
    background:'#cccccc'
}
class CreateNewStudent extends Component{


    constructor(props){
        super(props)
        this.state = {
            statusBar: 60,
            status:0,

            newStudent:{},
            parent:{},
            lessons:[],

            subjects: Subjects,
            lessonTypes:LessonTypes,
            yearGroups:YearGroups,
            teachers:null,
            days:Days,

            studentFirstName:null,
            studentLastName:null,
            discountRate:null,
            school:null,
            yearGroup:null,
            ability:null,

            parentFirstName:null,
            parentLastName:null,
            parentEmail:null,

            showModal:false


          
        }
    }

    componentDidMount = async () =>{
       await this.getTeachers();
       console.log(this.state.teachers)
      
    }

    getTeachers = async () =>{
        await axios.get('/api/get-all-teachers')
        .then(async response => {
            var teachers = response.data
            this.setState({teachers:teachers})
        })
    }

    createNewStudent = async (e) =>{
        var parentObjId = null
        var parentApiStr = "/api/create-parent?fn="+this.state.parentFirstName.toString()+
                                             "&ln="+this.state.parentLastName.toString()+
                                             "&e="+this.state.parentEmail.toString()

          
        await axios.get(parentApiStr)
        .then(async response => {
             parentObjId = await response.data._id;
             console.log(response.data._id)
         
        });
        
        var studentObjectId = null;
        var studentApiStr = "/api/create-student?fn="+this.state.studentFirstName.toString()+
                                                "&ln="+this.state.studentLastName.toString()+
                                                "&d="+this.state.discountRate.toString()+
                                                "&pid="+parentObjId.toString()  

        console.log('test')
        await axios.get(studentApiStr)
        .then(async response => {
             studentObjectId = await response.data._id;
             console.log(response.data._id)
         
        });

        await this.state.lessons.map(async (lesson,index)=>{
            var lessonApiStr = await '/api/create-lesson?&s='+lesson.subject.toString()+
                                                  '&rkey='+lesson.code.toString()+
                                                  '&day='+lesson.day.toString()+
                                                  '&sid='+studentObjectId.toString()+
                                                  '&tid='+lesson.teacher.toString()+
                                                  '&p='+lesson.price.toString()+
                                                  '&sd='+ (new Date()).toString() ///To-do allow user to enter custom date , need field        

            
             await axios.get(lessonApiStr)
            .then(response => {
                 console.log(response.data)
             
          });
        })
      
   
    }
    
    toggleModal = (e)=>{
        this.setState({showModal:!this.state.showModal})
    }
    goBack = ()=>{
        this.setState({status:this.state.status-1})
    }

    moveUpStatus = async  (e)=> {
        
        if( this.state.studentFirstName == null |          
            this.state.studentLastName == null |
            this.state.parentFirstName == null |
            this.state.parentLastName == null |
            this.state.parentEmail == null |
            this.state.discountRate == null |
            this.state.school == null |
            this.state.ability == null |
            this.state.yearGroup == null 
            ){
                alert('data to fill')
        
        }else{
            this.setState({status:1})

        }        
        
    }
    moveToStatusTwo = ()=>{
        this.setState({status:2})
    }
    //Student
    setStudentFirstName = (e) =>{
        this.setState({studentFirstName:e.target.value})
    }
    setStudentLastName = (e) =>{
        this.setState({studentLastName:e.target.value})
    }
    setDiscountRate = (e) =>{
        this.setState({discountRate:e.target.value})
    }
    setSchool = (e) =>{
        this.setState({school:e.target.value})
    }
    setYearGroup = (e) =>{
        this.setState({yearGroup: e.target.value})
    }
    setAbility = (e) =>{
        this.setState({ability:e.target.value})
    }
   
    //Parent
    setParentFirstName = (e) =>{
        this.setState({parentFirstName:e.target.value})
    }
    setParentLastName = (e) =>{
        this.setState({parentLastName:e.target.value})
    }
    setParentEmail = (e) =>{
        this.setState({parentEmail:e.target.value})
    }  
    

    addNewLesson = (e) =>{

        var yearGroup = this.state.yearGroup;
        if(yearGroup.toString().includes("KS")){
            console.log(yearGroup)
            yearGroup = yearGroup.charAt(2)
        }else{
            yearGroup = yearGroup.charAt(0)
        }
        var newLesson = {
            subject:null,
            lessonType:null,
            teacher:null,
            code:yearGroup+"00",
            day:null,
            price:null
        }
        this.setState({lessons:this.state.lessons.concat(newLesson)})
    }
    removeNewLesson = (e,index) =>{
                
        if (index > -1) {
            var lessons = this.state.lessons;
            lessons.splice(index,1)
          
            this.setState({lessons:lessons})
          }

    }
     setCharAt = (str,index,chr) => {
       
        return str.substring(0,index) + chr + str.substring(index+1);
    }
    setLessonCode = async (e,index,pos) =>{
        
        var lessons = this.state.lessons
        var lesson = lessons[index]
        var code = lesson.code;
        var newCode = this.setCharAt(code,pos,e.target.value.charAt(0))
         
        lesson.code = newCode;


        await this.setState({lessons:lessons})

        if(pos == 1){
            this.setLessonType(e,index)
        }else {
            this.setLessonSubject(e,index)
        }
    
    }

    setLessonSubject = async (e,index) =>{
        var lessons = this.state.lessons
        var lesson = lessons[index]
        lesson.subject = e.target.value;     
        await this.setState({lessons:lessons})
    
       }
    
    setLessonType = async (e,index) =>{
        var lessons = this.state.lessons
        var lesson = lessons[index]
        lesson.lessonType = e.target.value;     
        await this.setState({lessons:lessons})
    
       }

      
   setLessonTeacher = async (e,index) =>{
    var lessons = this.state.lessons
        var lesson = lessons[index]
        lesson.teacher = e.target.value;     
        await this.setState({lessons:lessons})

   }

   setLessonPrice = async (e,index) =>{
    var lessons = this.state.lessons
        var lesson = lessons[index]
        lesson.price = e.target.value;     
        await this.setState({lessons:lessons})
   }

    setLessonDay = async (e,index) =>{
        
        var lessons = this.state.lessons
        var lesson = lessons[index]
        lesson.day = e.target.value;     
        await this.setState({lessons:lessons})
        
   }

   addPrice = async (lessons) =>{

        lessons.map((lesson,index)=>{
            var code = lesson.code.toString();
            var price = Prices[code]
            lesson.price = price
        })

        return lessons

   }

   checkLessonData = async () =>{
      
       var dataFilled = true;
       var lessons = this.state.lessons;
    
       lessons = await this.addPrice(lessons);
      
       await lessons.map((lesson,index)=>{
        Object.keys(lesson).map(key => {
            console.log(lesson[key])
         if(lesson[key] == null){
             dataFilled = false;
         }
          })
 
         
       })

       if(!dataFilled){
        alert('data missing')
    }else{
        this.moveToStatusTwo();
    }
    
   }

 
    render(){
        return(
            <div  style={background}>
                <h1>Student Details</h1>
             
                <div style={{padding:'20px 50px'}}>
                    
                <ProgressBar animated now={this.state.statusBar} />
                </div>

                {this.state.status == 0?
                 <div className='form-style card container' style={{background:'#f2f2f2'}}>
                <div className="form-group">
                     <label >Parent First Name</label>
                     <input  class="form-control"  placeholder="parent first name"  onChange={this.setParentFirstName}/>
                 </div>
                 <div className="form-group">
                     <label >Parent Last Name</label>
                     <input  class="form-control"  placeholder="parent last name"  onChange={this.setParentLastName}/>
                 </div>
                 <div className="form-group">
                     <label >Parent Email</label>
                     <input  class="form-control"  placeholder="parent name" onChange={this.setParentEmail}/>
                 </div>

                 <div className="form-group">
                     <label >First Name</label>
                     <input  class="form-control"  placeholder={this.state.studentFirstName != null?this.state.studentFirstName:'first name'} onChange={this.setStudentFirstName} required/>
                 </div>
                 <div className="form-group">
                     <label >Last Name</label>
                     <input  class="form-control"  placeholder="last name" onChange={this.setStudentLastName}/>
                 </div>
                
                 <div className="form-group">
                     <label >Discount Rate</label>
                     <input  class="form-control"  placeholder="percentage rate"  onChange={this.setDiscountRate}/>
                 </div>
                 <div className="form-group">
                     <label >School</label>
                     <input  class="form-control"  placeholder="School Name"  onChange={this.setSchool}/>
                 </div>
                 <div className="form-group">
                     <label >Year Group</label>
                     <select class="form-control" id="exampleFormControlSelect1" onChange={this.setYearGroup}>
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


                 <div className="form-group">
                     <label >General Ability</label>
                     <input  class="form-control"  placeholder="ability"  onChange={this.setAbility}/>
                 </div>
                 
                 <button className="btn btn-primary" onClick={this.moveUpStatus}>
                     Done
                 </button>

           
             </div>
                :null}
               {this.state.status == 1?
                   <div className='form-style card container' style={{background:'#f2f2f2'}}>
                        <button className="btn btn-primary"
                          onClick={this.goBack}
                        >back</button>
                       <h3>Assign Lessons</h3>
                   
                       <button className="btn btn-success" onClick={this.addNewLesson}>
                            Add Lesson +
                       </button>
                            

                       {this.state.lessons.length>0? 
                            <table>
                                <thead>

                           
                                <tr className="row">
                                    <th className="col">
                                        Subject
                                    </th>
                                    <th className="col">
                                        Lesson Type
                                    </th>
                                    <th className="col">
                                        Teacher
                                    </th>
                                    <th className="col">
                                        Price
                                    </th>
                                    <th className="col">
                                        Day
                                    </th>
                                    <th className="col">
                                        Delete
                                    </th>
                                </tr> 

                                </thead>  
                                {
                                <tbody>

                               {
                            this.state.lessons.map((lesson,index)=>(
                                <tr className="row">
                                    <td className="col">
                                        <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>{this.setLessonCode(e,index,2)}}>
                                        <option></option>
                                            {this.state.subjects?
                                                this.state.subjects.map((item,index)=>(
                                                    <option>{item}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                                        </select>
                                    </td>
                                    <td className="col">
                                    <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>{this.setLessonCode(e,index,1)}}>
                                        <option></option>
                                            {this.state.lessonTypes?
                                                this.state.lessonTypes.map((item,index)=>(
                                                    <option>{item}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                                        </select>
                                    </td>
                                    <td className="col">
                                      <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setLessonTeacher(e,index)}>
                                        <option></option>
                                            {this.state.teachers?
                                              this.state.teachers.map((item,index) => 
                                                <option value={item._id}>{item.name}</option>
                                            )
                                            :
                                            <option>error</option>
                                            }
                                        </select>
                                    </td>
                                                               
                                    <td className="col">
                                        { 
                                            this.state.lessons?
                                                this.state.lessons[index].code?
                                                    Prices[this.state.lessons[index].code]?
                                                        Prices[this.state.lessons[index].code]
                                                    :"No Rate"
                                                :null
                                            :null
                                            
                                        } 
                                    
                                    </td>
                                    <td className="col">
                                      <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setLessonDay(e,index)}>
                                        <option></option>
                                            {this.state.days?
                                              Object.keys(this.state.days).map(key => 
                                                <option value={key}>{this.state.days[key]}</option>
                                            )
                                            :
                                            <option>error</option>
                                            }
                                        </select>
                                    </td>   
                                    <td className="col">
                                        <button className="btn btn-danger" onClick={(e)=>this.removeNewLesson(e,index)}>x</button>
                                    </td>                                  
                                </tr>
                            ))}
                             </tbody>

                                    }</table>
                        :null}
  
                   <button className="btn btn-primary" onClick={()=>this.checkLessonData()}>
                       Done
                   </button>
  
             
               </div>
               :null}

               {this.state.status == 2?
               <div className='form-style card container' style={{background:'#f2f2f2'}}>
                   <button className="btn btn-primary"
                          onClick={this.goBack}
                        >back</button>
                    <h3>Confirm Changes</h3>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">First Name</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.studentFirstName}</div>
                    </div>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">Last Name</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.studentLastName}</div>
                    </div>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">Last Name</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.studentLastName}</div>
                    </div>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">Discount Rate</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.discountRate}</div>
                    </div>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">School</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.school}</div>
                    </div>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">Year Group</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.yearGroup}</div>
                    </div>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">Ability</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.ability}</div>
                    </div>
                    <hr/>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">Parent First Name</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.parentFirstName}</div>
                    </div>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">Parent Last Name</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.parentLastName}</div>
                    </div>
                    <div class="input-group input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="inputGroup-sizing-sm">Parent Email</span>
                        </div>
                        <div type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">{this.state.parentEmail}</div>
                    </div>
                    <hr/>
                    {this.state.lessons?
                        this.state.lessons.length>0?
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>
                                            Subject
                                        </th>
                                        <th>
                                            Lesson Type
                                        </th>
                                        <th>
                                            Price
                                        </th>
                                        <th>
                                            Teacher
                                        </th>
                                        <th>
                                            Day
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.lessons.map((lesson,index)=>(
                                        <tr>
                                            <td>{lesson.subject}</td>
                                            <td>{lesson.lessonType}</td>
                                            <td>{lesson.price}</td>
                                            <td>{lesson.teacher}</td>
                                            <td>{lesson.day}</td>                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        :null
                    :null}
               
               <button className="btn btn-danger" onClick={this.toggleModal}>
                   Add New Student
               </button>
               <Modal isOpen={this.state.showModal} toggle={this.toggleModal} >
                        <ModalHeader >You are about to add a new student</ModalHeader>
                        <ModalBody>
                            the details you have entered will be saved, please make sure you haven't enterted any data we are not allowed to collect and please
                            ensure the data you have entered is correct
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary"
                                onClick={this.createNewStudent}
                            >Add New Student </Button>{' '}
                            <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

               </div>
               :null}

               
            </div>
          )  }



}

export default CreateNewStudent;