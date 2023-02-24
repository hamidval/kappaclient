import React,{Component} from 'react'
import DatePicker from "react-datepicker";
import Prices from '../Enums/Prices'
import Subjects from '../Enums/Subjects'
import LessonTypes from '../Enums/LessonType'
import Days from '../Enums/Days'
import "react-datepicker/dist/react-datepicker.css";
import YearGroups from '../Enums/YearGroup';
import axios from 'axios'
import PaymentTypes from '../Enums/PaymentTypes';
import Constants from '../../Constants';
const maxLength  = 15;
function validateEmail (email) {
    const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexp.test(email);
  }
class CreateNewStudent2 extends Component{


    constructor(props){
        super(props)
        this.state = {

            parent:{},
            students:[],
            subjects:Subjects,
            lessonTypes:LessonTypes,
            yearGroups:YearGroups,
            paymentTypes:PaymentTypes,
            teachers:null,
            days:Days,
            formSubmitted:false,
            emailExists:null,
            options :{ authorization: this.props.token,userid:this.props.userId }
            


          
        }
    }
    componentDidMount = async () =>{
        console.log("mount")
        await this.getTeachers();
        console.log(this.state.teachers)
       
     }


    getTeachers = async () =>{
    
        await axios.get('/api/teacher')
        .then(async response => {
            var teachers = response.data
            console.log(teachers)
            this.setState({teachers:teachers})
        })
    }

    checkIfEmailExists = async (e)=>{
        const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var email = this.state.parent.email
        var correctFormat = await  regexp.test(email);    
        
        if(correctFormat){
            
            await axios.get('/api/parent/check-email?email='+email)
            .then(async response => {
                console.log(response.data)
                this.setState({emailExists:(response.data.length > 0)})
                
            })
        }else{
            alert('incorrect format for email')
        }
        
    }

    addStudent = async () =>{
        const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var correctFormat = await  regexp.test(this.state.parent.email);       
        
        if(correctFormat&&this.state.parent.firstName != null && this.state.parent.lastName != null && this.state.parent.email != null){
           
            var obj = {
                firstName:null,
                lastName:null,
                yearGroup:"1KS",
                paymentMethod:0,
                discount:0,
                school:null,
                ability:null,
                lessons:[]
    
            }
    
            this.setState({students:[...this.state.students,obj]})

        }else{
            alert('missing parent info')
        }
        
    }

    removeStudent = (index) =>{
        var students = this.state.students;
        students.splice(index,1)
        this.setState({students:students})

    }

    removeLesson = (index,lessonIndex) =>{
        var students = this.state.students
        var student = students[index];
       
        student.lessons.splice(lessonIndex,1)
        this.setState({students:students})

    }

    addLesson = async (index) =>{
        var students = this.state.students
        var student = students[index]
        var isCorrect = true;

        console.log(student.yearGroup)
        if(student.firstName == null || student.lastName == null || student.discount == null || student.school == null || student.yearGroup == null || student.ability == null){
            isCorrect = await false;
        }


        if(isCorrect){
        var lesson = {
            subject:null,
            teacher:null,
            rateKey:student.yearGroup.charAt(0)+"00",
            day:null,
            price:null,
            startDate:new Date('2021-07-24'),
            endDate:new Date('2024-07-24'),
            padj:0,
            fadj:0
        }

        student.lessons.push(lesson)

        this.setState({students:[...students]})
        }else{
            alert('missing info')
        }
    }


    setParentFirstName = (e) =>{
        var parent = this.state.parent

        parent.firstName = e.target.value;

        this.setState({parent:parent})


    }
    setParentLastName = (e) =>{
        var parent = this.state.parent

        parent.lastName = e.target.value;

        this.setState({parent:parent})


    }

    setParentEmail = (e) =>{

        

        var parent = this.state.parent

        parent.email = e.target.value;

        this.setState({parent:parent})


    }

    setStudentFirstName = (e,index) =>{
        var students = this.state.students
        var student = students[index]
        student.firstName = e.target.value

        this.setState({students:students})
    }

    setStudentLastName = (e,index) =>{
        var students = this.state.students
        var student = students[index]
        student.lastName = e.target.value

        this.setState({students:students})
    }

    setStudentSchool = (e,index) =>{
        var students = this.state.students
        var student = students[index]
        student.school = e.target.value

        this.setState({students:students})
    }
    setStudentDiscount= (e,index) =>{

        if(parseFloat(e.target.value) <=100 && parseFloat(e.target.value)>=0){
        var students = this.state.students
        var student = students[index]
        student.discount = e.target.value

        this.setState({students:students})
        }else{
            alert('invalid discount')
        }
    }

    setStudentYearGroup = async (e,index) =>{
      
        var students = this.state.students
        var student = students[index]

        student.yearGroup = YearGroups[e.target.value]
        
        if(student.lessons.length > 0){
            student.lessons.map(async(lesson,index)=>{               
                
                lesson.rateKey = await this.setCharAt(lesson.rateKey,0,student.yearGroup.charAt(0))
                lesson.groupRateKey = await this.setCharAt(lesson.rateKey,0,student.yearGroup.charAt(0))
                lesson.singleRateKey = await this.setCharAt(lesson.rateKey,0,student.yearGroup.charAt(0))
                console.log(lesson.rateKey);
                lesson.price = await Prices[lesson.rateKey]

            })
        }
       student.yearGroup = e.target.value
        await this.setState({students:students})
    }

    setStudentAbility = (e,index) =>{
        var students = this.state.students
        var student = students[index]
        student.ability = e.target.value

        this.setState({students:students})
    }

    setStudentPaymentMethod = (e,index) =>{
        var students = this.state.students
        var student = students[index]
        student.paymentMethod = e.target.value

        this.setState({students:students})
    }

    setCharAt = (str,index,chr) => {
      
        return str?.substring(0,index) + chr + str?.substring(index+1);
    }


    setSubject = (e,studentIndex,lessonIndex) =>{
        var subject = Subjects[e.target.value]
        var subjectIndex = e.target.value;
        var students = this.state.students
        var student = students[studentIndex]
        var lesson = student.lessons[lessonIndex]
        lesson.subject = subjectIndex;
        lesson.rateKey = this.setCharAt(lesson.rateKey,2,subject.charAt(0))
        lesson.groupRateKey = this.setCharAt(lesson.rateKey,2,subject.charAt(0))
        lesson.singleRateKey = this.setCharAt(lesson.rateKey,2,subject.charAt(0))
        lesson.price = Prices[lesson.rateKey]
        lesson.singlePrice = Prices[lesson.singleRateKey]
        console.log(lesson.rateKey)
        this.setState({students:students})


    }

    setLessonType = async (e,studentIndex,lessonIndex) =>{
        var lessonType = e.target.value;
        var students = this.state.students
        var student = students[studentIndex]
        var lesson = student.lessons[lessonIndex]
        
        lesson.rateKey = await this.setCharAt(lesson.rateKey,1,lessonType.charAt(0))
        lesson.groupRateKey = await this.setCharAt(lesson.rateKey,1,"G")
        lesson.singleRateKey = await this.setCharAt(lesson.rateKey,1,"O")
        lesson.price = await Prices[lesson.rateKey]
        lesson.singlePrice = Prices[lesson.singleRateKey]
        lesson.rate = await lesson.price*Constants.teacherCommision;


        if(lessonType.charAt(0) === "G")
        {           
            lesson.lessonType = 0

        } else if(lessonType.charAt(0) === "O"){
         
            lesson.lessonType = 1
        }
        console.log(lesson.rateKey)
        await this.setState({students:students})


    }

    setTeacher = (e,studentIndex,lessonIndex) =>{
        var teacherId = e.target.value;
        var students = this.state.students
        var student = students[studentIndex]
        var lesson = student.lessons[lessonIndex]
        
        lesson.teacher = teacherId

        console.log(lesson)
        this.setState({students:students})


    }

    setLessonDay = (e,studentIndex,lessonIndex) =>{
        var day = e.target.value;
        var students = this.state.students
        var student = students[studentIndex]
        var lesson = student.lessons[lessonIndex]
        
        lesson.day = day

        
        this.setState({students:students})


    }

    setLessonStartDate = (studentIndex,lessonIndex,date) =>{
      
        var students = this.state.students
        var student = students[studentIndex]
        var lesson = student.lessons[lessonIndex]
        
        lesson.startDate = date

        
        this.setState({students:students})


    }
    setLessonEndDate = (studentIndex,lessonIndex,date) =>{
       
        var students = this.state.students
        var student = students[studentIndex]
        var lesson = student.lessons[lessonIndex]
        
        lesson.endDate = date

        
        this.setState({students:students})


    }

    setLessonFeeAdj = (e,studentIndex,lessonIndex) =>{
       
        var students = this.state.students
        var student = students[studentIndex]
        var lesson = student.lessons[lessonIndex]
        
        lesson.fadj = e.target.value?e.target.value:0

        
        this.setState({students:students})


    }

    setLessonPayAdj = (e,studentIndex,lessonIndex) =>{
       
        var students = this.state.students
        var student = students[studentIndex]
        var lesson = student.lessons[lessonIndex]
        
        lesson.padj = e.target.value?e.target.value:0

        
        this.setState({students:students})


    }
    

    save = async () =>{


            var parent = 
            {
                parentFirstName: this.state.parent.firstName,
                parentLastName: this.state.parent.lastName,
                parentEmail: this.state.parent.email
                

            }

            parent.students = this.state.students.map((student, index)=>
            {
                var lessons = student.lessons.map((lesson, index)=>
                {
                    var les = 
                    {
                        studentId: 0,
                        teacherId: parseInt(lesson.teacher),
                        subject: parseInt(lesson.subject),
                        yearGroup: parseInt(student.yearGroup),
                        feeAdjustment: parseInt(lesson.fadj),
                        payAdjustment: parseInt(lesson.padj)
                    }
                    return les
                })

                var obj = 
                {
                    firstName: student.firstName,
                    lastName: student.lastName,
                    lessons: lessons
                }

                return obj;
            })
         

            console.log(parent);

            const data2 = {
                ParentFirstName: "james",
                "parentLastName": "reed",
                "parentEmail": "hamid-val@hotmail.co.uk",
                "students": [
                  {
                    "firstName": "john",
                    "lastName": "reed",
                    "lessons": [
                      {
                        "studentId": 0,
                        "teacherId": 1,
                        "subject": 0,
                        "yearGroup": 4,
                        "singleFee": 30,
                        "groupFee": 25,
                        "singlePay": 20,
                        "groupPay": 15,
                        "lessonType":0,
                        startDate: '2022-01-01',
                        endDate: '2025-01-01'
                      }
                    ]
                  }
                ]
              }
            
             await axios.post('/api/lesson', data2)
             .then(async(response)=>{
                 await this.setState({formSubmitted:true}) 

                 setTimeout(function(){window.location.reload()}, 5000);
         })
           


    

    }

    

   

 
    render(){
        return(<div >
            <h1>Add New Students</h1>


            <div className="container">
                <p>
                    Students don't have to have lessons to be added to the system
                </p>
                {
                    this.state.formSubmitted?
                        <div class="alert alert-success" role="alert">
                        congrats lessons have been created
                    </div>
                    :null
                }

            <div className='form-style card container mb-3' style={{background:'#f2f2f2'}}>
                <div className="form-group">
                     <label >Parent First Name</label>
                     <input  class="form-control" maxLength={maxLength} type="text" placeholder="parent first name" onChange={this.setParentFirstName}  />
                 </div>
                 <div className="form-group">
                     <label >Parent Last Name</label>
                     <input  class="form-control" maxLength={maxLength} type="text"  placeholder="parent last name" onChange={this.setParentLastName} required   />
                 </div>
                 <div className="form-group">
                     <label >Parent Email</label>
                     <input  class="form-control" type="email"  placeholder="parent email" onChange={this.setParentEmail}    />
                 </div>
                 <div>
                     <button className='btn btn-primary' onClick={this.checkIfEmailExists}>check email</button>
                 </div>
                 <div className='mt-3'>
                     {this.state.emailExists == null?
                           null
                     :(
                        this.state.emailExists == true?
                            <div class="alert alert-danger" role="alert">
                                email exists
                            </div>
                            
                            :
                            
                            <div class="alert alert-primary" role="alert">
                                email looks fine
                            </div>
                     )}
                 </div>

            </div>

            <div>
                <div className="row mb-3">
                    <div className="col">
                        <button className="btn btn-primary" onClick={this.addStudent} >Add Student</button>
                    </div>
                    <div className="col">
                        <button className="btn btn-primary" onClick={this.save} >Save Data</button>
                    </div>

                </div>
                
            </div>

            {this.state.students.length>0?
                this.state.students.map((student,index)=>(
                    <div className='form-style card container' style={{background:'#f2f2f2'}}>
                    <div className="row">
                        <div className="col">
                        <div className="form-group">
                            <label >First Name</label>
                            <input  class="form-control"  placeholder="first name" onChange={e=>this.setStudentFirstName(e,index)}  />
                        </div>
                        </div>
                        <div className="col">
                        <div className="form-group">
                            <label >Last Name</label>
                            <input  class="form-control"  placeholder="last name" onChange={e=>this.setStudentLastName(e,index)}  />
                        </div>
                        </div> 
                        <div className="col">
                        <div className="form-group">
                            <label >School</label>
                            <input  class="form-control"  placeholder="school" onChange={e=>this.setStudentSchool(e,index)}    />
                        </div>
                        </div>
                        <div className="col">
                        <div className="form-group">
                            <label >Discount</label>
                            <input type="number" min="0" max="100" step="1" class="form-control"  placeholder="0-100"  onChange={e=>this.setStudentDiscount(e,index)}  />
                        </div>
                        </div>
                        <div className="col">
                        <div className="form-group">
                            <label >Year Group</label>
                            
                            <select  class="form-control" onChange={e=>this.setStudentYearGroup(e,index)} >


                                            {this.state.yearGroups?
                                             
                                             
                                                this.state.yearGroups.map((item,index)=>(
                                                    <option disabled={student.lessons?.length >0} value={index} >{item}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                            </select>
                        </div>
                        </div> 
                        <div className="col">
                        <div className="form-group">
                            <label >Ability</label>
                            <input  class="form-control"  placeholder="ability.." onChange={e=>this.setStudentAbility(e,index)}   />
                        </div>
                        </div>
                        <div className="col">
                        <div className="form-group">
                            <label >Pay Type</label>
                            <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>{this.setStudentPaymentMethod(e,index)}}>
                                                
                                                    {this.state.paymentTypes?
                                                        this.state.paymentTypes.map((item,index)=>(
                                                            <option value={index}>{item}</option>
                                                        ))
                                                    :
                                                    <option>error</option>
                                                    }
                            </select>
                        </div>
                        </div>
                        <div className="col">
                        <div className="form-group">
                            <label >lessons</label>
                            <button  class="btn btn-success" onClick={e=>this.addLesson(index)}>Add lessons</button>
                        </div>
                        </div>
                        <div className="col">
                        <div className="form-group">
                            <label >delete</label>
                            <button  class="btn btn-danger" onClick={e=>this.removeStudent(index)}>delete</button>
                        </div>
                        </div>             

                    </div>
                        {
                            student.lessons?

                                student.lessons.map((lesson,lessonIndex)=>(
                                    <div className="row">
                                        <div className="col">
                                            <div className="form-group">
                                                <label >Subject</label>
                                                <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>{this.setSubject(e,index,lessonIndex)}}>
                                                <option></option>
                                                    {this.state.subjects?
                                                        this.state.subjects.map((item,index)=>(
                                                            <option value={index}>{item}</option>
                                                        ))
                                                    :
                                                    <option>error</option>
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="form-group">
                                                <label >Type</label>
                                                <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>{this.setLessonType(e,index,lessonIndex)}}>
                                                <option></option>
                                                    {this.state.lessonTypes?
                                                        this.state.lessonTypes.map((item,index)=>(
                                                            <option>{item}</option>
                                                        ))
                                                    :
                                                    <option>error</option>
                                                    }
                                                </select>
                                            </div>
                                        </div> 
                                        <div className="col">
                                            <div className="form-group">
                                                <label >teacher</label>
                                                <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setTeacher(e,index,lessonIndex)}>
                                                    <option></option>
                                                        {this.state.teachers?
                                                        this.state.teachers.map((item,index) => 
                                                            <option value={item._id}>{item.firstName}</option>
                                                        )
                                                        :
                                                        <option>error</option>
                                                        }
                                                    </select>
                                            </div>
                                        </div>
                                        <div className="col">
                                            { 
                                                lesson?
                                                    lesson.rateKey?
                                                        Prices[lesson.rateKey]?
                                                            Prices[lesson.rateKey]
                                                        :"No Rate"
                                                    :null
                                                :null
                                                
                                            } 
                                        </div>
                                        <div className="col">
                                            <label>Pay Adj</label>
                                            <input onChange={(e)=>this.setLessonPayAdj(e,index,lessonIndex)} className="form-control" type="number"/>
                                        </div>
                                        <div className="col">
                                            <label>Fee Adj</label>
                                            <input onChange={(e)=>this.setLessonFeeAdj(e,index,lessonIndex)} className="form-control" type="number"/>
                                        </div>
                                        <div className="col">
                                            <label >days</label>
                                            <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setLessonDay(e,index,lessonIndex)}>
                                            <option></option>
                                                {this.state.days?
                                                Object.keys(this.state.days).map(key => 
                                                    <option value={key}>{this.state.days[key]}</option>
                                                )
                                                :
                                                <option>error</option>
                                                }
                                            </select>
                                        </div>
                                        <div className="col">
                                            <label >start date</label>
                                            <DatePicker className="form-control"
                                                selected={lesson.startDate}
                                                onChange={date => this.setLessonStartDate(index,lessonIndex,date)}
                                                />  
                                        </div>
                                        <div className="col">
                                            <label >end date</label>
                                            <DatePicker className="form-control"
                                                selected={lesson.endDate}
                                                onChange={date => this.setLessonEndDate(index,lessonIndex,date)}
                                                 />  
                                        </div>
                                        <div className="col">
                                        <label >remove</label>
                                        <div className="form-group">
                                            
                                            <button  class="btn btn-danger" onClick={e=>this.removeLesson(index,lessonIndex)} >remove</button>
                                        </div>
                                        </div>   
                                    </div>    
                                ))
                            
                            :null
                        }
                    </div>
                ))
            :null}

            </div>

        </div> )  }



}

export default CreateNewStudent2;